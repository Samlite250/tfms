/**
 * Database Cleanup Script - Purge Dummy Farmers
 * Run: node scripts/clean_dummy_farmers.js
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

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

async function clean() {
    console.log('🧹 Starting COMS dummy farmers cleanup...\n');

    console.log('🔐 Signing in as admin...');
    try {
        await signInWithEmailAndPassword(auth, 'admin@mahembe-coffee.rw', 'admin123');
        console.log('  ✅ Signed in as admin');
    } catch (error) {
        console.error(`  ❌ Sign-in failed: ${error.message}`);
        return;
    }

    // 1. Clean up "farmers" collection
    console.log('\n🌾 Querying active farmers...');
    const farmersColRef = collection(db, 'farmers');
    const farmersSnapshot = await getDocs(farmersColRef);
    let deletedFarmersCount = 0;
    let skippedFarmersCount = 0;

    for (const farmerDoc of farmersSnapshot.docs) {
        const data = farmerDoc.data();
        const id = farmerDoc.id;
        // Dummy farmers start with "FRM-"
        if (id.startsWith('FRM-')) {
            console.log(`  🗑️ Deleting dummy farmer: ${data.name} (${id})`);
            await deleteDoc(doc(db, 'farmers', id));
            deletedFarmersCount++;

            // Also clean up any matching user account if it exists
            try {
                await deleteDoc(doc(db, 'users', id));
            } catch (err) {
                // Safe to ignore if didn't exist
            }
        } else {
            console.log(`  🌾 Keeping real farmer: ${data.name} (${id})`);
            skippedFarmersCount++;
        }
    }

    // 2. Clean up "pending_farmers" collection
    console.log('\n⏳ Querying pending farmers...');
    const pendingColRef = collection(db, 'pending_farmers');
    const pendingSnapshot = await getDocs(pendingColRef);
    let deletedPendingCount = 0;

    for (const pendingDoc of pendingSnapshot.docs) {
        const data = pendingDoc.data();
        const id = pendingDoc.id;
        if (id.startsWith('FRM-')) {
            console.log(`  🗑️ Deleting dummy pending farmer: ${data.name} (${id})`);
            await deleteDoc(doc(db, 'pending_farmers', id));
            deletedPendingCount++;
        }
    }

    // 3. Mark the collections as "seeded" in system_status so clients don't re-seed them
    console.log('\n⚙️ Marking farmers collection as seeded in system status...');
    const statusDocRef = doc(db, 'system_status', 'farmers');
    await setDoc(statusDocRef, {
        seeded: true,
        updatedAt: serverTimestamp(),
    });
    console.log('  ✅ Set system_status/farmers to seeded');

    // Sign out
    await auth.signOut();

    console.log('\n🎉 Cleanup complete!');
    console.log(`  Deleted dummy active farmers: ${deletedFarmersCount}`);
    console.log(`  Deleted dummy pending farmers: ${deletedPendingCount}`);
    console.log(`  Remaining real farmers: ${skippedFarmersCount}`);
}

clean().catch(console.error);
