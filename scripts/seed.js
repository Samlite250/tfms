/**
 * Firebase Seed Script
 * Run: node scripts/seed.js
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

const envPath = resolve(new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), '../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const USERS = [
  { email: 'admin@tfms.com', password: 'admin123', displayName: 'James Mwangi', role: 'admin', department: 'Administration', phone: '+254 700 100 200' },
  { email: 'manager@tfms.com', password: 'manager123', displayName: 'Sarah Wanjiku', role: 'factory_manager', department: 'Administration', phone: '+254 700 100 201' },
  { email: 'collection@tfms.com', password: 'collection123', displayName: 'Peter Kamau', role: 'collection_officer', department: 'Collection', phone: '+254 700 100 202' },
  { email: 'production@tfms.com', password: 'production123', displayName: 'Mary Njeri', role: 'production_officer', department: 'Production', phone: '+254 700 100 203' },
  { email: 'store@tfms.com', password: 'store123', displayName: 'David Omondi', role: 'store_keeper', department: 'Packaging', phone: '+254 700 100 204' },
  { email: 'accountant@tfms.com', password: 'accountant123', displayName: 'Grace Akinyi', role: 'accountant', department: 'Finance', phone: '+254 700 100 205' },
];

const DEPARTMENTS = [
  { id: 'dept-1', name: 'Administration', description: 'General administration and management', status: 'active' },
  { id: 'dept-2', name: 'Production', description: 'Tea processing and manufacturing', status: 'active' },
  { id: 'dept-3', name: 'Collection', description: 'Green leaf collection and farmer relations', status: 'active' },
  { id: 'dept-4', name: 'Packaging', description: 'Tea packaging and storage', status: 'active' },
  { id: 'dept-5', name: 'Finance', description: 'Financial management and accounting', status: 'active' },
  { id: 'dept-6', name: 'Quality Control', description: 'Product quality testing and assurance', status: 'active' },
  { id: 'dept-7', name: 'Maintenance', description: 'Equipment and facility maintenance', status: 'active' },
];

const TEA_GRADES = [
  { id: 'grade-1', name: 'PF1', description: 'Premium First Grade', pricePerKg: 850 },
  { id: 'grade-2', name: 'PF2', description: 'Premium Second Grade', pricePerKg: 750 },
  { id: 'grade-3', name: 'PF3', description: 'Premium Third Grade', pricePerKg: 650 },
  { id: 'grade-4', name: 'PD', description: 'Pekoe Dust', pricePerKg: 550 },
  { id: 'grade-5', name: 'Dust', description: 'Tea Dust', pricePerKg: 450 },
  { id: 'grade-6', name: 'Fannings', description: 'Tea Fannings', pricePerKg: 500 },
  { id: 'grade-7', name: 'BOP', description: 'Broken Orange Pekoe', pricePerKg: 700 },
  { id: 'grade-8', name: 'BOPSM', description: 'Broken Orange Pekoe Superior Medium', pricePerKg: 680 },
];

const COLLECTION_CENTERS = [
  { id: 'center-1', name: 'Central Collection Point', location: 'Kericho Town', manager: 'John Kiprop', status: 'active', farmerCount: 120 },
  { id: 'center-2', name: 'Northern Hub', location: 'Nandi Hills', manager: 'Alice Chebet', status: 'active', farmerCount: 85 },
  { id: 'center-3', name: 'Southern Hub', location: 'Kisii Town', manager: 'Robert Onyango', status: 'active', farmerCount: 95 },
  { id: 'center-4', name: 'Eastern Hub', location: 'Kakamega Town', manager: 'Jane Wambui', status: 'active', farmerCount: 70 },
  { id: 'center-5', name: 'Western Hub', location: 'Bungoma Town', manager: 'Samuel Wekesa', status: 'inactive', farmerCount: 45 },
];

function waitForAuth(auth) {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function seed() {
  console.log('🌱 Starting TFMS seed...\n');

  // Step 1: Create Auth users
  for (const userData of USERS) {
    try {
      console.log(`Creating user: ${userData.email}`);
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: userData.displayName });
      console.log(`  ✅ Auth created: ${userData.displayName}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`  ⏭️  Auth exists: ${userData.email}`);
      } else {
        console.error(`  ❌ Failed: ${userData.email} - ${error.message}`);
      }
    }
  }

  // Step 2: Sign in as admin to write Firestore data
  console.log('\n🔐 Signing in as admin...');
  try {
    await signInWithEmailAndPassword(auth, 'admin@tfms.com', 'admin123');
    console.log('  ✅ Signed in as admin');
  } catch (error) {
    console.error(`  ❌ Sign-in failed: ${error.message}`);
    console.log('  ⚠️ Skipping Firestore seed. Please ensure admin@tfms.com exists in Firebase Auth.');
    return;
  }

  // Step 3: Wait for auth state
  await waitForAuth(auth);
  if (!auth.currentUser) {
    console.error('  ❌ Not authenticated. Aborting.');
    return;
  }

  // Step 4: Write user Firestore documents by signing in as each user
  console.log('\n👤 Seeding user profiles...');
  for (const userData of USERS) {
    try {
      await signInWithEmailAndPassword(auth, userData.email, userData.password);
      await waitForAuth(auth);
      if (!auth.currentUser) {
        console.error(`  ❌ ${userData.email}: not authenticated after sign-in`);
        continue;
      }
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`  ✅ ${userData.displayName} (${userData.role})`);
    } catch (error) {
      console.error(`  ❌ ${userData.email}: ${error.message}`);
    }
  }

  // Step 5: Write departments
  console.log('\n📋 Seeding departments...');
  const batch1 = writeBatch(db);
  for (const dept of DEPARTMENTS) {
    batch1.set(doc(db, 'departments', dept.id), { ...dept, createdAt: serverTimestamp() });
    console.log(`  ✅ ${dept.name}`);
  }
  await batch1.commit();

  // Step 6: Write tea grades
  console.log('\n🍃 Seeding tea grades...');
  const batch2 = writeBatch(db);
  for (const grade of TEA_GRADES) {
    batch2.set(doc(db, 'settings', `grade-${grade.id}`), { ...grade, type: 'grade', createdAt: serverTimestamp() });
    console.log(`  ✅ ${grade.name} - ${grade.description}`);
  }
  await batch2.commit();

  // Step 7: Write collection centers
  console.log('\n📍 Seeding collection centers...');
  const batch3 = writeBatch(db);
  for (const center of COLLECTION_CENTERS) {
    batch3.set(doc(db, 'settings', center.id), { ...center, type: 'center', createdAt: serverTimestamp() });
    console.log(`  ✅ ${center.name}`);
  }
  await batch3.commit();

  // Step 8: Write factory settings
  console.log('\n⚙️ Seeding factory settings...');
  await setDoc(doc(db, 'settings', 'factory'), {
    name: 'Kericho Premium Tea Factory',
    registrationNumber: 'TF-2024-001',
    address: 'Kericho-Nakuru Highway',
    city: 'Kericho',
    province: 'Kericho County',
    country: 'Kenya',
    phone: '+254 52 22000',
    email: 'info@kerichotea.co.ke',
    website: 'www.kerichotea.co.ke',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    workingHoursStart: '06:00',
    workingHoursEnd: '18:00',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log('  ✅ Factory information');

  // Sign out
  await auth.signOut();

  console.log('\n🎉 Seed complete!');
  console.log('\nYou can now log in with:');
  console.log('  Admin:       admin@tfms.com / admin123');
  console.log('  Manager:     manager@tfms.com / manager123');
  console.log('  Collection:  collection@tfms.com / collection123');
  console.log('  Production:  production@tfms.com / production123');
  console.log('  Store:       store@tfms.com / store123');
  console.log('  Accountant:  accountant@tfms.com / accountant123');
}

seed().catch(console.error);
