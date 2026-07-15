import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

const DEMO_USERS = [
  { uid: 'admin-001', email: 'admin@tfms.com', password: 'admin123', displayName: 'James Mwangi', role: 'admin', status: 'active', department: 'Administration', phone: '+254 700 100 200' },
  { uid: 'collection-001', email: 'collection@tfms.com', password: 'collection123', displayName: 'Peter Kamau', role: 'collection_officer', status: 'active', department: 'Collection', phone: '+254 700 100 202' },
  { uid: 'production-001', email: 'production@tfms.com', password: 'production123', displayName: 'Mary Njeri', role: 'production_officer', status: 'active', department: 'Production', phone: '+254 700 100 203' },
  { uid: 'store-001', email: 'store@tfms.com', password: 'store123', displayName: 'David Omondi', role: 'store_keeper', status: 'active', department: 'Packaging', phone: '+254 700 100 204' },
  { uid: 'accountant-001', email: 'accountant@tfms.com', password: 'accountant123', displayName: 'Grace Akinyi', role: 'accountant', status: 'active', department: 'Finance', phone: '+254 700 100 205' },
];

let firebaseAvailable = false;

async function checkFirebase() {
  try {
    if (auth && auth.app && auth.app.options && auth.app.options.apiKey && !auth.app.options.apiKey.includes('demo')) {
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

  useEffect(() => {
    checkFirebase().then(() => {
      if (firebaseAvailable) {
        setupFirebaseAuth();
      } else {
        const saved = sessionStorage.getItem('tfms_demo_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.displayName });
            setUserProfile(parsed);
          } catch { /* ignore */ }
        }
        setLoading(false);
      }
    });
  }, []);

  function setupFirebaseAuth() {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                role: 'collection_officer',
                department: '',
                phone: '',
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              const newProfile = await getDoc(doc(db, 'users', firebaseUser.uid));
              setUser(firebaseUser);
              setUserProfile({ id: newProfile.id, ...newProfile.data() });
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
      return () => unsubscribe();
    });
  }

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

    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password. Try one of the demo accounts below.');
    }

    const u = { uid: found.uid, email: found.email, displayName: found.displayName };
    const profile = { uid: found.uid, email: found.email, displayName: found.displayName, role: found.role, status: found.status, department: found.department };
    setUser(u);
    setUserProfile(profile);
    sessionStorage.setItem('tfms_demo_user', JSON.stringify(profile));
    return u;
  }

  async function register(email, password, profileData) {
    if (firebaseAvailable) {
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

      await auth.signOut();
      return firebaseUser;
    }

    throw new Error('Registration is only available when Firebase is configured.');
  }

  async function approveUser(uid) {
    if (firebaseAvailable) {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', uid), {
        status: 'active',
        updatedAt: serverTimestamp(),
      });
    }
  }

  async function rejectUser(uid) {
    if (firebaseAvailable) {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', uid), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
      });
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
    sessionStorage.removeItem('tfms_demo_user');
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
    demoUsers: firebaseAvailable ? [] : DEMO_USERS,
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
