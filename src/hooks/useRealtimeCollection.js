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

export default function useRealtimeCollection(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const seededRef = useRef(false);

  const { filters = [], orderByField = null, orderDirection = "desc", seedData = null } = options;

  useEffect(() => {
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
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(filters), orderByField, orderDirection]);

  const add = useCallback(
    async (item) => {
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [collectionName]
  );

  const update = useCallback(
    async (id, updates) => {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id) => {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    },
    [collectionName]
  );

  return { data, loading, error, add, update, remove };
}
