import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../firebase/config";

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

function toSnake(s) {
  return s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase());
}

function toCamel(s) {
  return s.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

function convertRow(row) {
  const result = {};
  for (const [k, v] of Object.entries(row)) {
    result[toCamel(k)] = v;
  }
  return result;
}

function convertFilterToSQL(filter) {
  return { field: toSnake(filter.field), operator: filter.operator || "==", value: filter.value };
}

export default function useRealtimeCollection(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const seededRef = useRef(false);
  const channelRef = useRef(null);

  const { filters = [], orderByField = null, orderDirection = "desc", seedData = null } = options;

  useEffect(() => {
    let settled = false;
    const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
    const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
    const key = rawKey.indexOf("eyJ") > 0 ? rawKey.slice(rawKey.indexOf("eyJ")) : rawKey;

    if (!url || !key) {
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
      return;
    }

    async function fetchData() {
      try {
        let q = supabase.from(collectionName).select("*");

        for (const f of filters) {
          const sf = convertFilterToSQL(f);
          if (sf.operator === "in") {
            q = q.in(sf.field, Array.isArray(sf.value) ? sf.value : [sf.value]);
          } else if (sf.operator === "array-contains") {
            q = q.contains(sf.field, sf.value);
          } else {
            const opMap = { "==": "eq", "!=": "neq", "<": "lt", "<=": "lte", ">": "gt", ">=": "gte" };
            q = q.filter(sf.field, opMap[sf.operator] || "eq", sf.value);
          }
        }

        if (orderByField) {
          q = q.order(toSnake(orderByField), { ascending: orderDirection === "asc" });
        }

        const { data: rows, error: fetchError } = await q;

        if (fetchError) {
          throw fetchError;
        }

        const items = (rows || []).map(convertRow);

        if (items.length > 0) {
          localStorage.setItem(`coms_seeded_${collectionName}`, "true");
        } else if (seedData && seedData.length > 0 && !seededRef.current) {
          seededRef.current = true;
          const seededKey = `coms_seeded_${collectionName}`;
          if (localStorage.getItem(seededKey) !== "true") {
            for (const item of seedData) {
              const { id: _id, ...rest } = item;
              const snakeRest = {};
              for (const [k, v] of Object.entries(rest)) {
                snakeRest[toSnake(k)] = v;
              }
              snakeRest.created_at = new Date().toISOString();
              snakeRest.updated_at = new Date().toISOString();
              await supabase.from(collectionName).insert(snakeRest);
            }
            localStorage.setItem(seededKey, "true");
          }
        }

        if (!settled) {
          settled = true;
          setData(items);
          setLoading(false);
        }
      } catch (err) {
        if (!settled) {
          settled = true;
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err.message);
          const stored = loadSeedFromStorage(collectionName) || seedData || [];
          setData(stored);
          setLoading(false);
        }
      }
    }

    fetchData();

    channelRef.current = supabase
      .channel(`${collectionName}-realtime`)
      .on("postgres_changes", { event: "*", schema: "public", table: collectionName }, (payload) => {
        if (payload.eventType === "INSERT") {
          const item = convertRow(payload.new);
          setData((prev) => {
            if (prev.some((d) => d.id === item.id)) return prev;
            const updated = [item, ...prev];
            saveToStorage(collectionName, updated);
            return updated;
          });
        } else if (payload.eventType === "UPDATE") {
          const item = convertRow(payload.new);
          setData((prev) => {
            const updated = prev.map((d) => (d.id === item.id ? item : d));
            saveToStorage(collectionName, updated);
            return updated;
          });
        } else if (payload.eventType === "DELETE") {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setData((prev) => {
              const updated = prev.filter((d) => d.id !== deletedId);
              saveToStorage(collectionName, updated);
              return updated;
            });
          }
        }
      })
      .subscribe();

    return () => {
      settled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [collectionName, JSON.stringify(filters), orderByField, orderDirection]);

  const add = useCallback(
    async (item) => {
      const itemId = item.id || `rec-${Date.now()}`;
      const newItem = { ...item, id: itemId };

      // Optimistic instant state & local storage update
      setData((prev) => {
        const filtered = prev.filter((d) => d.id !== itemId);
        const updated = [newItem, ...filtered];
        saveToStorage(collectionName, updated);
        return updated;
      });

      const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
      const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
      if (!url || !rawKey) return itemId;

      try {
        const snakeItem = {};
        for (const [k, v] of Object.entries(item)) {
          snakeItem[toSnake(k)] = v;
        }
        snakeItem.created_at = new Date().toISOString();
        snakeItem.updated_at = new Date().toISOString();

        await supabase.from(collectionName).insert(snakeItem);
      } catch (err) {
        console.warn(`Background sync warning on add for ${collectionName}:`, err);
      }
      return itemId;
    },
    [collectionName]
  );

  const update = useCallback(
    async (id, updates) => {
      // Optimistic instant state & local storage update
      setData((prev) => {
        const updated = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
        saveToStorage(collectionName, updated);
        return updated;
      });

      const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
      const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
      if (!url || !rawKey) return;

      try {
        const snakeUpdates = {};
        for (const [k, v] of Object.entries(updates)) {
          snakeUpdates[toSnake(k)] = v;
        }
        snakeUpdates.updated_at = new Date().toISOString();

        await supabase
          .from(collectionName)
          .update(snakeUpdates)
          .eq("id", id);
      } catch (err) {
        console.warn(`Background sync warning on update for ${collectionName}:`, err);
      }
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id) => {
      // Optimistic instant state & local storage update
      setData((prev) => {
        const updated = prev.filter((d) => d.id !== id);
        saveToStorage(collectionName, updated);
        return updated;
      });

      const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
      const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
      if (!url || !rawKey) return;

      try {
        await supabase
          .from(collectionName)
          .delete()
          .eq("id", id);
      } catch (err) {
        console.warn(`Background sync warning on delete for ${collectionName}:`, err);
      }
    },
    [collectionName]
  );

  return { data, loading, error, add, update, remove, addItem: add, updateItem: update, deleteItem: remove };
}

export { useRealtimeCollection };

