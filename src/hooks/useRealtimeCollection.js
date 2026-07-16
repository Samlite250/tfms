import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

function loadSeedFromStorage(collectionName) {
  try {
    const raw = localStorage.getItem(`coms_collection_${collectionName}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(collectionName, items) {
  try {
    localStorage.setItem(`coms_collection_${collectionName}`, JSON.stringify(items));
  } catch { /* ignore */ }
}

export default function useRealtimeCollection(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const seededRef = useRef(false);

  const { filters = [], orderByField = null, orderDirection = "desc", seedData = null } = options;

  useEffect(() => {
    let settled = false;

    const useOfflineFallback = (reason, silent = false) => {
      if (settled) return;
      settled = true;
      if (!silent) console.warn(`Offline mode for ${collectionName}:`, reason);
      const stored = loadSeedFromStorage(collectionName);
      const seededKey = `coms_seeded_${collectionName}`;
      const isSeeded = localStorage.getItem(seededKey) === "true";
      let items;
      if (stored && stored.length > 0) {
        items = stored;
        localStorage.setItem(seededKey, "true");
      } else if (isSeeded) {
        items = [];
      } else {
        items = seedData || [];
        localStorage.setItem(seededKey, "true");
      }
      saveToStorage(collectionName, items);
      setData(items);
      setLoading(false);
    };

    // Skip Firestore entirely when running with a demo/placeholder API key
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
    if (!apiKey || apiKey.includes("demo") || apiKey.includes("placeholder") || apiKey.length < 20) {
      useOfflineFallback("demo API key — using localStorage", true);
      return;
    }

    const timeout = setTimeout(() => {
      useOfflineFallback('Firestore connection timed out (no real Firebase configured)');
    }, 3000);

    try {
      let q = collection(db, collectionName);

      const constraints = [];
      for (const f of filters) {
        constraints.push(where(f.field, f.operator || "==", f.value));
      }
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          clearTimeout(timeout);
          if (settled) { unsubscribe(); return; }
          settled = true;

          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          if (items.length > 0) {
            try {
              localStorage.setItem(`coms_seeded_${collectionName}`, "true");
              const statusDocRef = doc(db, "system_status", collectionName);
              getDoc(statusDocRef).then((statusSnap) => {
                if (!statusSnap.exists() || !statusSnap.data().seeded) {
                  setDoc(statusDocRef, { seeded: true, updatedAt: serverTimestamp() });
                }
              }).catch(() => { });
            } catch { }
          } else if (seedData && seedData.length > 0 && !seededRef.current) {
            seededRef.current = true;
            try {
              const statusDocRef = doc(db, "system_status", collectionName);
              const statusSnap = await getDoc(statusDocRef);
              if (statusSnap.exists() && statusSnap.data().seeded) {
                console.log(`Collection ${collectionName} was already seeded online.`);
                localStorage.setItem(`coms_seeded_${collectionName}`, "true");
              } else {
                console.log(`Seeding ${collectionName} online...`);
                for (const item of seedData) {
                  const { id: _id, ...rest } = item;
                  await addDoc(collection(db, collectionName), {
                    ...rest,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                }
                await setDoc(statusDocRef, { seeded: true, updatedAt: serverTimestamp() });
                localStorage.setItem(`coms_seeded_${collectionName}`, "true");
              }
            } catch (err) {
              console.error(`Error checking/seeding ${collectionName}:`, err);
            }
          }

          setData(items);
          setLoading(false);
        },
        (err) => {
          clearTimeout(timeout);
          console.error(`Real-time error for ${collectionName}:`, err);
          useOfflineFallback(err.message);
        }
      );

      return () => { clearTimeout(timeout); unsubscribe(); };
    } catch (err) {
      clearTimeout(timeout);
      useOfflineFallback(err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(filters), orderByField, orderDirection]);

  const add = useCallback(
    async (item) => {
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      } catch (err) {
        console.warn(`Offline add for ${collectionName}:`, err.message);
        const offlineId = `offline-${Date.now()}`;
        const newItem = { id: offlineId, ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setData((prev) => {
          const updated = [newItem, ...prev];
          saveToStorage(collectionName, updated);
          return updated;
        });
        return offlineId;
      }
    },
    [collectionName]
  );

  const update = useCallback(
    async (id, updates) => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn(`Offline update for ${collectionName}:`, err.message);
        setData((prev) => {
          const updated = prev.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          );
          saveToStorage(collectionName, updated);
          return updated;
        });
      }
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`Offline remove for ${collectionName}:`, err.message);
        setData((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          saveToStorage(collectionName, updated);
          return updated;
        });
      }
    },
    [collectionName]
  );

  return { data, loading, error, add, update, remove };
}
