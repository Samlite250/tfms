/**
 * Firebase Seed Script - COMS
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
  { email: 'admin@mahembe-coffee.rw', password: 'admin123', displayName: 'Jean-Paul Habimana', role: 'admin', department: 'Administration', phone: '+250 788 100 200' },
  { email: 'manager@mahembe-coffee.rw', password: 'manager123', displayName: 'Marie Claire Uwimana', role: 'factory_manager', department: 'Administration', phone: '+250 788 100 201' },
  { email: 'collection@mahembe-coffee.rw', password: 'collection123', displayName: 'Epiphanie Mukamana', role: 'collection_officer', department: 'Collection', phone: '+250 788 100 202' },
  { email: 'production@mahembe-coffee.rw', password: 'production123', displayName: 'Alexis Habimana', role: 'production_officer', department: 'Production', phone: '+250 788 100 203' },
  { email: 'store@mahembe-coffee.rw', password: 'store123', displayName: 'Anselme Rwegasira', role: 'store_keeper', department: 'Packaging', phone: '+250 788 100 204' },
  { email: 'accountant@mahembe-coffee.rw', password: 'accountant123', displayName: 'Arsene Nshimiyimana', role: 'accountant', department: 'Finance', phone: '+250 788 100 205' },
];

const DEPARTMENTS = [
  { id: 'dept-1', name: 'Administration', description: 'General administration and management', status: 'active' },
  { id: 'dept-2', name: 'Production', description: 'Coffee processing and manufacturing', status: 'active' },
  { id: 'dept-3', name: 'Collection', description: 'Coffee cherry collection and farmer relations', status: 'active' },
  { id: 'dept-4', name: 'Packaging', description: 'Coffee packaging and storage', status: 'active' },
  { id: 'dept-5', name: 'Finance', description: 'Financial management and accounting', status: 'active' },
  { id: 'dept-6', name: 'Quality Control', description: 'Product quality testing and assurance', status: 'active' },
  { id: 'dept-7', name: 'Maintenance', description: 'Equipment and facility maintenance', status: 'active' },
];

const COFFEE_GRADES = [
  { id: 'grade-1', name: 'AA', description: 'Screen 17/18 Large Bean', pricePerKg: 1200 },
  { id: 'grade-2', name: 'AB', description: 'Screen 15/16 Medium Bean', pricePerKg: 1000 },
  { id: 'grade-3', name: 'PB', description: 'Peaberry', pricePerKg: 1100 },
  { id: 'grade-4', name: 'C', description: 'Small Bean', pricePerKg: 800 },
  { id: 'grade-5', name: 'TT', description: 'Light Beans from AA/AB', pricePerKg: 700 },
  { id: 'grade-6', name: 'T', description: 'Smallest Beans', pricePerKg: 600 },
  { id: 'grade-7', name: 'E', description: 'Elephant Bean', pricePerKg: 900 },
  { id: 'grade-8', name: 'FNGS', description: 'Fines', pricePerKg: 500 },
];

const COLLECTION_CENTERS = [
  { id: 'center-1', name: 'Mahembe Central', location: 'Muhanga Town', manager: 'Jean-Paul Habimana', status: 'active', farmerCount: 120 },
  { id: 'center-2', name: 'Muhanga Hub', location: 'Muhanga District', manager: 'Epiphanie Mukamana', status: 'active', farmerCount: 85 },
  { id: 'center-3', name: 'Ruyanza Collection Point', location: 'Ruyanza Sector', manager: 'Emmanuel Ndayisaba', status: 'active', farmerCount: 95 },
  { id: 'center-4', name: 'Kabuga Station', location: 'Kabuga Sector', manager: 'Jean Mugabo', status: 'active', farmerCount: 70 },
  { id: 'center-5', name: 'Nyamagana Center', location: 'Nyamagana Sector', manager: 'Theogene Bigirimana', status: 'inactive', farmerCount: 45 },
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
  console.log('🌱 Starting COMS seed...\n');

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
    await signInWithEmailAndPassword(auth, 'admin@mahembe-coffee.rw', 'admin123');
    console.log('  ✅ Signed in as admin');
  } catch (error) {
    console.error(`  ❌ Sign-in failed: ${error.message}`);
    console.log('  ⚠️ Skipping Firestore seed. Please ensure admin@mahembe-coffee.rw exists in Firebase Auth.');
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

  // Step 6: Write coffee grades
  console.log('\n☕ Seeding coffee grades...');
  const batch2 = writeBatch(db);
  for (const grade of COFFEE_GRADES) {
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
    name: 'Mahembe Coffee Factory',
    registrationNumber: 'COMS-2024-001',
    address: 'Muhanga-Nyanza Road',
    city: 'Muhanga',
    province: 'Southern Province',
    country: 'Rwanda',
    phone: '+250 788 500 000',
    email: 'info@mahembe-coffee.rw',
    website: 'www.mahembe-coffee.rw',
    currency: 'RWF',
    timezone: 'Africa/Kigali',
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
  console.log('  Admin:       admin@mahembe-coffee.rw / admin123');
  console.log('  Manager:     manager@mahembe-coffee.rw / manager123');
  console.log('  Collection:  collection@mahembe-coffee.rw / collection123');
  console.log('  Production:  production@mahembe-coffee.rw / production123');
  console.log('  Store:       store@mahembe-coffee.rw / store123');
  console.log('  Accountant:  accountant@mahembe-coffee.rw / accountant123');
}

seed().catch(console.error);
