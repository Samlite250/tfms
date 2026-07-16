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
    const useOfflineFallback = (reason) => {
      console.warn(`Offline mode for ${collectionName}:`, reason);
      const stored = loadSeedFromStorage(collectionName);
      const items = stored && stored.length > 0 ? stored : (seedData || []);
      saveToStorage(collectionName, items);
      setData(items);
      setLoading(false);
    };

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
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          if (items.length === 0 && seedData && seedData.length > 0 && !seededRef.current) {
            seededRef.current = true;
            try {
              for (const item of seedData) {
                const { id: _id, ...rest } = item;
                await addDoc(collection(db, collectionName), {
                  ...rest,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (err) {
              console.error(`Error seeding ${collectionName}:`, err);
            }
          }

          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Real-time error for ${collectionName}:`, err);
          useOfflineFallback(err.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
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
