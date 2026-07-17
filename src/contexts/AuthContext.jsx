import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../firebase/config';
import {
  sendRegistrationConfirmation,
  sendAdminAlert,
  sendAccountApproved,
  sendAccountRejected
} from '../services/emailService';

const AuthContext = createContext(null);

function normalizeUser(sbUser) {
  if (!sbUser) return null;
  return {
    uid: sbUser.id,
    email: sbUser.email,
    displayName: sbUser.user_metadata?.displayName || sbUser.user_metadata?.display_name || '',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const registrationInProgressRef = useRef(false);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (registrationInProgressRef.current) return;
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !profile) {
            await supabase.from('users').upsert({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.displayName || '',
              role: 'collection_officer',
              department: '',
              phone: '',
              status: 'pending',
            });
            await supabase.auth.signOut();
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }

          if (profile.status === 'pending') {
            await supabase.auth.signOut();
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }

          setUser(normalizeUser(session.user));
          setUserProfile({ id: profile.id, ...profile });
        } catch {
          setUser(normalizeUser(session.user));
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function login(email, password) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const localUser = { uid: `local-${Date.now()}`, email, displayName: name };
      const localProfile = { uid: localUser.uid, email, displayName: name, role: 'admin', status: 'active', department: 'Administration', phone: '' };
      setUser(localUser);
      setUserProfile(localProfile);
      return localUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile?.status === 'pending') {
      await supabase.auth.signOut();
      throw new Error('Your account is pending admin approval. Please wait for an administrator to activate your account.');
    }
    if (profile?.status === 'suspended') {
      await supabase.auth.signOut();
      throw new Error('Your account has been suspended. Please contact an administrator.');
    }

    return data.user;
  }

  async function register(email, password, profileData) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      const uid = `local-reg-${Date.now()}`;
      const localProfile = {
        uid, email, displayName: profileData.displayName,
        role: profileData.role, department: profileData.department,
        phone: profileData.phone, status: 'pending',
      };
      const pending = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
      pending.push(localProfile);
      localStorage.setItem('coms_pending_users', JSON.stringify(pending));
      if (profileData.role === 'farmer') {
        const farmerProfile = {
          id: uid, userId: uid, email, name: profileData.displayName,
          phone: profileData.phone, district: profileData.district || '',
          sector: profileData.sector || '', cell: profileData.cell || '',
          village: profileData.village || '', province: 'Southern',
          country: 'Rwanda', farmSize: profileData.farmSize || 0,
          coffeeVariety: profileData.coffeeVariety || '',
          collectionCenter: profileData.collectionCenter || '',
          totalDeliveries: 0, totalWeight: 0, status: 'Pending',
          joinedDate: new Date().toISOString().split('T')[0],
        };
        const pendingFarmers = JSON.parse(localStorage.getItem('coms_pending_farmers') || '[]');
        pendingFarmers.push(farmerProfile);
        localStorage.setItem('coms_pending_farmers', JSON.stringify(pendingFarmers));
      }
      try { await sendRegistrationConfirmation(email, profileData.displayName); } catch {}
      try { await sendAdminAlert({ displayName: profileData.displayName, email, role: profileData.role, phone: profileData.phone }); } catch {}
      return localProfile;
    }

    registrationInProgressRef.current = true;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { displayName: profileData.displayName } },
      });
      if (error) throw error;
      const sbUser = data.user;

      await supabase.from('users').upsert({
        id: sbUser.id,
        email: sbUser.email,
        display_name: profileData.displayName,
        role: profileData.role,
        department: profileData.department,
        phone: profileData.phone,
        status: 'pending',
      });

      if (profileData.role === 'farmer') {
        await supabase.from('pending_farmers').insert({
          id: sbUser.id,
          user_id: sbUser.id,
          email: sbUser.email,
          name: profileData.displayName,
          phone: profileData.phone,
          district: profileData.district || '',
          sector: profileData.sector || '',
          cell: profileData.cell || '',
          village: profileData.village || '',
          province: 'Southern',
          country: 'Rwanda',
          farm_size: profileData.farmSize || 0,
          coffee_variety: profileData.coffeeVariety || '',
          collection_center: profileData.collectionCenter || '',
          total_deliveries: 0,
          total_weight: 0,
          status: 'Pending',
          joined_date: new Date().toISOString().split('T')[0],
        });
      }

      try {
        await sendRegistrationConfirmation(sbUser.email, profileData.displayName);
        await sendAdminAlert({ displayName: profileData.displayName, email: sbUser.email, role: profileData.role, phone: profileData.phone });
      } catch (err) {
        console.warn("Registration email notification failed:", err);
      }

      await supabase.auth.signOut();
      return normalizeUser(sbUser);
    } finally {
      registrationInProgressRef.current = false;
    }
  }

  async function approveUser(uid) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    if (!url) {
      const pending = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
      const approved = pending.find((u) => u.uid === uid);
      if (approved) {
        approved.status = 'active';
        const approvedUsers = JSON.parse(localStorage.getItem('coms_approved_users') || '[]');
        approvedUsers.push(approved);
        localStorage.setItem('coms_approved_users', JSON.stringify(approvedUsers));
        localStorage.setItem('coms_pending_users', JSON.stringify(pending.filter((u) => u.uid !== uid)));
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
        try { await sendAccountApproved(approved.email, approved.displayName, approved.role); } catch {}
      }
      return;
    }

    try {
      const { data: userData } = await supabase.from('users').select('*').eq('id', uid).single();
      if (userData) {
        try { await sendAccountApproved(userData.email, userData.display_name, userData.role); } catch {}
      }
    } catch {}

    await supabase.from('users').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', uid);

    try {
      const { data: pendingDoc } = await supabase.from('pending_farmers').select('*').eq('id', uid).single();
      if (pendingDoc) {
        await supabase.from('farmers').upsert({
          id: pendingDoc.id,
          user_id: pendingDoc.user_id,
          email: pendingDoc.email,
          name: pendingDoc.name,
          phone: pendingDoc.phone,
          district: pendingDoc.district,
          sector: pendingDoc.sector,
          cell: pendingDoc.cell,
          village: pendingDoc.village,
          province: pendingDoc.province,
          country: pendingDoc.country,
          farm_size: pendingDoc.farm_size,
          coffee_variety: pendingDoc.coffee_variety,
          collection_center: pendingDoc.collection_center,
          total_deliveries: pendingDoc.total_deliveries,
          total_weight: pendingDoc.total_weight,
          status: 'Active',
          joined_date: pendingDoc.joined_date,
        });
        await supabase.from('pending_farmers').delete().eq('id', uid);
      }
    } catch { /* not a farmer or already removed */ }
  }

  async function rejectUser(uid) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    if (!url) {
      const pending = JSON.parse(localStorage.getItem('coms_pending_users') || '[]');
      const rejectedUser = pending.find((u) => u.uid === uid);
      if (rejectedUser) {
        try { await sendAccountRejected(rejectedUser.email, rejectedUser.displayName); } catch {}
      }
      localStorage.setItem('coms_pending_users', JSON.stringify(pending.filter((u) => u.uid !== uid)));
      return;
    }

    try {
      const { data: userData } = await supabase.from('users').select('*').eq('id', uid).single();
      if (userData) {
        try { await sendAccountRejected(userData.email, userData.display_name); } catch {}
      }
    } catch {}

    await supabase.from('users').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', uid);

    try {
      await supabase.from('pending_farmers').delete().eq('id', uid);
    } catch { /* not a farmer or already removed */ }
  }

  async function deleteUserAccount(uid) {
    await supabase.from('users').delete().eq('id', uid);
  }

  async function logout() {
    setUserProfile(null);
    setUser(null);
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    if (url) {
      await supabase.auth.signOut();
    }
  }

  async function forgotPassword(email) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    if (url) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
    }
  }

  async function resetPassword(oobCode, newPassword) {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    if (url) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
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
