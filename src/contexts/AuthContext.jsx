import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import {
  sendRegistrationConfirmation,
  sendAdminAlert,
  sendAccountApproved,
  sendAccountRejected
} from '../services/emailService';

const AuthContext = createContext(null);

let firebaseAvailable = false;

async function checkFirebase() {
  try {
    const apiKey = auth?.app?.options?.apiKey || '';
    const projectId = auth?.app?.options?.projectId || '';
    if (apiKey && projectId && !apiKey.includes('demo-placeholder') && apiKey.length > 20) {
      firebaseAvailable = true;
    }
  } catch {
    firebaseAvailable = false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // A newly registered user is briefly authenticated while their pending
  // profile is being created. Do not let the auth observer sign them out in
  // the middle of that transaction.
  const registrationInProgressRef = useRef(false);

  useEffect(() => {
    // Hold a ref to unsubscribe so we can clean up when the component unmounts
    let unsubFn = null;

    checkFirebase().then(() => {
      if (firebaseAvailable) {
        import('firebase/auth').then(({ onAuthStateChanged }) => {
          unsubFn = onAuthStateChanged(auth, async (firebaseUser) => {
            if (registrationInProgressRef.current) return;
            if (firebaseUser) {
              try {
                const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (profileDoc.exists()) {
                  const profile = { id: profileDoc.id, ...profileDoc.data() };

                  if (profile.status === 'pending') {
                    await auth.signOut();
                    setUser(null);
                    setUserProfile(null);
                    setLoading(false);
                    return;
                  }

                  setUser(firebaseUser);
                  setUserProfile(profile);
                } else {
                  // Auto-create profile — set status 'pending' to enforce approval flow
                  await setDoc(doc(db, 'users', firebaseUser.uid), {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || '',
                    role: 'collection_officer',
                    department: '',
                    phone: '',
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                  // Sign them out immediately — they must wait for approval
                  await auth.signOut();
                  setUser(null);
                  setUserProfile(null);
                }
              } catch {
                setUser(firebaseUser);
                setUserProfile(null);
              }
            } else {
              setUser(null);
              setUserProfile(null);
            }
            setLoading(false);
          });
        });
      } else {
        setLoading(false);
      }
    });

    // Proper cleanup — unsubscribes the Firestore auth listener on unmount
    return () => { if (unsubFn) unsubFn(); };
  }, []);

  async function login(email, password) {
    if (firebaseAvailable) {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);

      const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (profileDoc.exists()) {
        const profile = profileDoc.data();
        if (profile.status === 'pending') {
          await auth.signOut();
          throw new Error('Your account is pending admin approval. Please wait for an administrator to activate your account.');
        }
        if (profile.status === 'suspended') {
          await auth.signOut();
          throw new Error('Your account has been suspended. Please contact an administrator.');
        }
      }

      return result.user;
    }

    // Offline/dev mode: create a local admin session from the email
    // First check if this email is a registered pending/approved user
    const approvedUsers = JSON.parse(localStorage.getItem('coms_approved_users') || '[]');
    const pendingUsers = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
    const approvedUser = approvedUsers.find((u) => u.email === email);
    const pendingUser = pendingUsers.find((u) => u.email === email);

    if (pendingUser && !approvedUser) {
      throw new Error('Your account is pending admin approval. Please wait for an administrator to activate your account.');
    }

    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const localUser = { uid: approvedUser?.uid || `local-${Date.now()}`, email, displayName: approvedUser?.displayName || name };
    const localProfile = approvedUser || { uid: localUser.uid, email, displayName: name, role: 'admin', status: 'active', department: 'Administration', phone: '' };
    setUser(localUser);
    setUserProfile(localProfile);
    return localUser;
  }

  async function register(email, password, profileData) {
    if (firebaseAvailable) {
      registrationInProgressRef.current = true;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: profileData.displayName });

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: firebaseUser.email,
          displayName: profileData.displayName,
          role: profileData.role,
          department: profileData.department,
          phone: profileData.phone,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (profileData.role === 'farmer') {
          await setDoc(doc(db, 'pending_farmers', firebaseUser.uid), {
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            name: profileData.displayName,
            phone: profileData.phone,
            district: profileData.district || '',
            sector: profileData.sector || '',
            cell: profileData.cell || '',
            village: profileData.village || '',
            province: 'Southern',
            country: 'Rwanda',
            farmSize: profileData.farmSize || 0,
            coffeeVariety: profileData.coffeeVariety || '',
            collectionCenter: profileData.collectionCenter || '',
            totalDeliveries: 0,
            totalWeight: 0,
            status: 'Pending',
            joinedDate: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
          });
        }

        try {
          await sendRegistrationConfirmation(firebaseUser.email, profileData.displayName);
          await sendAdminAlert({
            displayName: profileData.displayName,
            email: firebaseUser.email,
            role: profileData.role,
            phone: profileData.phone,
          });
        } catch (err) {
          console.warn("Registration email notification failed:", err);
        }

        await auth.signOut();
        return firebaseUser;
      } finally {
        registrationInProgressRef.current = false;
      }
    }

    // Offline/dev mode: create a local pending user
    const uid = `local-reg-${Date.now()}`;
    const localProfile = {
      uid,
      email,
      displayName: profileData.displayName,
      role: profileData.role,
      department: profileData.department,
      phone: profileData.phone,
      status: 'pending',
    };

    // Store in localStorage so admin can approve it
    const pending = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
    pending.push(localProfile);
    localStorage.setItem('coms_pending_users', JSON.stringify(pending));

    // If farmer, also save a pending farmer profile
    if (profileData.role === 'farmer') {
      const farmerProfile = {
        id: uid,
        userId: uid,
        email,
        name: profileData.displayName,
        phone: profileData.phone,
        district: profileData.district || '',
        sector: profileData.sector || '',
        cell: profileData.cell || '',
        village: profileData.village || '',
        province: 'Southern',
        country: 'Rwanda',
        farmSize: profileData.farmSize || 0,
        coffeeVariety: profileData.coffeeVariety || '',
        collectionCenter: profileData.collectionCenter || '',
        totalDeliveries: 0,
        totalWeight: 0,
        status: 'Pending',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      const pendingFarmers = JSON.parse(localStorage.getItem('coms_pending_farmers') || '[]');
      pendingFarmers.push(farmerProfile);
      localStorage.setItem('coms_pending_farmers', JSON.stringify(pendingFarmers));
    }

    // Trigger Email Notification (works offline/local using the email server proxy too!)
    try {
      await sendRegistrationConfirmation(email, profileData.displayName);
    } catch (err) {
      console.warn("Failed to send signup confirmation email:", err);
    }

    try {
      await sendAdminAlert({
        displayName: profileData.displayName,
        email,
        role: profileData.role,
        phone: profileData.phone,
      });
    } catch (err) {
      console.warn("Failed to send admin signup alert email:", err);
    }

    return localProfile;
  }

  async function approveUser(uid) {
    if (firebaseAvailable) {
      // Fetch user profile info first to send the email
      try {
        const { getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await sendAccountApproved(userData.email, userData.displayName, userData.role);
        }
      } catch (err) {
        console.warn("Failed to send account approval email:", err);
      }

      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', uid), {
        status: 'active',
        updatedAt: serverTimestamp(),
      });
      // If farmer, move from pending_farmers to farmers collection
      try {
        const { getDoc: getFirestoreDoc, setDoc: setFirestoreDoc } = await import('firebase/firestore');
        const pendingDoc = await getFirestoreDoc(doc(db, 'pending_farmers', uid));
        if (pendingDoc.exists()) {
          const farmerData = pendingDoc.data();
          await setFirestoreDoc(doc(db, 'farmers', uid), {
            ...farmerData,
            status: 'Active',
            updatedAt: serverTimestamp(),
          });
          await import('firebase/firestore').then(({ deleteDoc }) =>
            deleteDoc(doc(db, 'pending_farmers', uid))
          );
        }
      } catch { /* ignore if not a farmer */ }
    } else {
      const pending = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
      const approved = pending.find((u) => u.uid === uid);
      if (approved) {
        approved.status = 'active';
        const approvedUsers = JSON.parse(localStorage.getItem('coms_approved_users') || '[]');
        approvedUsers.push(approved);
        localStorage.setItem('coms_approved_users', JSON.stringify(approvedUsers));
        localStorage.setItem('coms_pending_users', JSON.stringify(pending.filter((u) => u.uid !== uid)));

        // If farmer, move profile from pending to active farmers
        if (approved.role === 'farmer') {
          const pendingFarmers = JSON.parse(localStorage.getItem('coms_pending_farmers') || '[]');
          const farmerProfile = pendingFarmers.find((f) => f.userId === uid || f.id === uid);
          if (farmerProfile) {
            farmerProfile.status = 'Active';
            const activeFarmers = JSON.parse(localStorage.getItem('coms_collection_farmers') || '[]');
            activeFarmers.unshift(farmerProfile);
            localStorage.setItem('coms_collection_farmers', JSON.stringify(activeFarmers));
            localStorage.setItem('coms_pending_farmers', JSON.stringify(pendingFarmers.filter((f) => f.userId !== uid && f.id !== uid)));
          }
        }

        try {
          await sendAccountApproved(approved.email, approved.displayName, approved.role);
        } catch (err) {
          console.warn("Failed to send account approval email:", err);
        }
      }
    }
  }

  async function rejectUser(uid) {
    if (firebaseAvailable) {
      try {
        const { getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await sendAccountRejected(userData.email, userData.displayName);
        }
      } catch (err) {
        console.warn("Failed to send account rejection email:", err);
      }

      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', uid), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
      });

      try {
        const { deleteDoc: delDoc } = await import('firebase/firestore');
        await delDoc(doc(db, 'pending_farmers', uid));
      } catch { /* not a farmer or already removed */ }
    } else {
      const pending = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
      const rejectedUser = pending.find((u) => u.uid === uid);
      if (rejectedUser) {
        try {
          await sendAccountRejected(rejectedUser.email, rejectedUser.displayName);
        } catch (err) {
          console.warn("Failed to send account rejection email:", err);
        }
      }
      localStorage.setItem('coms_pending_users', JSON.stringify(pending.filter((u) => u.uid !== uid)));
    }
  }

  async function deleteUserAccount(uid) {
    if (firebaseAvailable) {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', uid));
    }
  }

  async function logout() {
    setUserProfile(null);
    setUser(null);
    if (firebaseAvailable) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
  }

  async function forgotPassword(email) {
    if (firebaseAvailable) {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    }
  }

  async function resetPassword(oobCode, newPassword) {
    if (firebaseAvailable) {
      const { confirmPasswordReset } = await import('firebase/auth');
      await confirmPasswordReset(auth, oobCode, newPassword);
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    approveUser,
    rejectUser,
    deleteUserAccount,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
