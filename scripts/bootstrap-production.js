/**
 * Creates the initial administrator and safe, clearly-labelled sample records.
 *
 * Usage (PowerShell):
 *   $env:COMS_INITIAL_ADMIN_EMAIL = 'admin@example.com'
 *   $env:COMS_INITIAL_ADMIN_PASSWORD = 'a-strong-password'
 *   npm.cmd run bootstrap:production
 *
 * The credentials are deliberately read from the process environment and are
 * never written to this repository or logged.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import {
  collectionsSeed,
  customersSeed,
  employeesSeed,
  expensesSeed,
  farmersSeed,
  inventorySeed,
  productionSeed,
  salesSeed,
} from '../src/firebase/seedData.js';

const rootDir = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const envPath = resolve(rootDir, '.env');

function readEnv(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        return separator === -1 ? [line, ''] : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
  );
}

const env = readEnv(envPath);
const adminEmail = process.env.COMS_INITIAL_ADMIN_EMAIL;
const adminPassword = process.env.COMS_INITIAL_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('Set COMS_INITIAL_ADMIN_EMAIL and COMS_INITIAL_ADMIN_PASSWORD before running this script.');
}

const requiredFirebaseKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

if (requiredFirebaseKeys.some((key) => !env[key] || /demo|placeholder/i.test(env[key]))) {
  throw new Error('A real Firebase configuration is required in .env.');
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

async function createOrSignInAdmin() {
  try {
    const credential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    await updateProfile(credential.user, { displayName: 'COMS Administrator' });
    return credential.user;
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error;
    const credential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    return credential.user;
  }
}

function writeRecords(batch, collectionName, records) {
  for (const record of records.slice(0, 5)) {
    const { id, ...data } = record;
    batch.set(doc(db, collectionName, id), {
      ...data,
      isSampleData: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

async function bootstrap() {
  const admin = await createOrSignInAdmin();

  await setDoc(doc(db, 'users', admin.uid), {
    email: admin.email,
    displayName: admin.displayName || 'COMS Administrator',
    role: 'admin',
    department: 'Administration',
    status: 'active',
    isInitialAdmin: true,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const batch = writeBatch(db);
  writeRecords(batch, 'farmers', farmersSeed);
  writeRecords(batch, 'coffeeCollections', collectionsSeed);
  writeRecords(batch, 'production', productionSeed);
  writeRecords(batch, 'inventory', inventorySeed);
  writeRecords(batch, 'customers', customersSeed);
  writeRecords(batch, 'sales', salesSeed);
  writeRecords(batch, 'expenses', expensesSeed);
  writeRecords(batch, 'employees', employeesSeed);
  await batch.commit();

  await auth.signOut();
  console.log('Production bootstrap completed: initial admin plus five labelled sample records in each core module.');
}

bootstrap().catch((error) => {
  console.error(`Bootstrap failed: ${error.message}`);
  process.exitCode = 1;
});
