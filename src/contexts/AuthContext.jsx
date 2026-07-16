import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

// ⚠️ SECURITY NOTE: These are DEMO-ONLY credentials for offline/dev use.
// NEVER use plaintext passwords in production. Replace with env vars before shipping.
const DEMO_USERS = [
  { uid: 'admin-001', email: 'admin@mahembe-coffee.rw', password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin123', displayName: 'Jean-Paul Habimana', role: 'admin', status: 'active', department: 'Administration', phone: '+250 788 100 200' },
  { uid: 'collection-001', email: 'collection@mahembe-coffee.rw', password: import.meta.env.VITE_DEMO_COLLECTION_PASSWORD || 'collection123', displayName: 'Epiphanie Mukamana', role: 'collection_officer', status: 'active', department: 'Collection', phone: '+250 788 100 202' },
  { uid: 'production-001', email: 'production@mahembe-coffee.rw', password: import.meta.env.VITE_DEMO_PRODUCTION_PASSWORD || 'production123', displayName: 'Alexis Habimana', role: 'production_officer', status: 'active', department: 'Production', phone: '+250 788 100 203' },
  { uid: 'store-001', email: 'store@mahembe-coffee.rw', password: import.meta.env.VITE_DEMO_STORE_PASSWORD || 'store123', displayName: 'Anselme Rwegasira', role: 'store_keeper', status: 'active', department: 'Packaging', phone: '+250 788 100 204' },
  { uid: 'accountant-001', email: 'accountant@mahembe-coffee.rw', password: import.meta.env.VITE_DEMO_ACCOUNTANT_PASSWORD || 'accountant123', displayName: 'Arsene Nshimiyimana', role: 'accountant', status: 'active', department: 'Finance', phone: '+250 788 100 205' },
  { uid: 'farmer-001', email: 'farmer@mahembe-coffee.rw', password: import.meta.env.VITE_DEMO_FARMER_PASSWORD || 'farmer123', displayName: 'Jean Mugabo', role: 'farmer', status: 'active', department: '', phone: '+250 788 200 101' },
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
    // Hold a ref to unsubscribe so we can clean up when the component unmounts
    let unsubFn = null;

    checkFirebase().then(() => {
      if (firebaseAvailable) {
        import('firebase/auth').then(({ onAuthStateChanged }) => {
          unsubFn = onAuthStateChanged(auth, async (firebaseUser) => {
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
        const saved = sessionStorage.getItem('coms_demo_user');
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

    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password. Try one of the demo accounts below.');
    }

    const u = { uid: found.uid, email: found.email, displayName: found.displayName };
    const profile = { uid: found.uid, email: found.email, displayName: found.displayName, role: found.role, status: found.status, department: found.department };
    setUser(u);
    setUserProfile(profile);
    sessionStorage.setItem('coms_demo_user', JSON.stringify(profile));
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
    sessionStorage.removeItem('coms_demo_user');
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
