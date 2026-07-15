import { useState, useEffect, useCallback } from 'react';
import {
  getCollection,
  getDocFromCollection,
  getCollectionCount,
} from '../firebase/firestoreService';

export function useCollection(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Destructure stable primitives to avoid using JSON.stringify(options) as a dep
  const {
    orderField = null,
    orderDirection = 'asc',
    limitCount = null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters = [],
  } = options;
  // Serialize filters array once for stable comparison
  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCollection(collectionName, options);
      setData(result);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, filtersKey, orderField, orderDirection, limitCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDocument(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await getDocFromCollection(collectionName, docId);
      setData(result);
    } catch (err) {
      console.error(`Error fetching document ${docId} from ${collectionName}:`, err);
      setError(err.message || 'Failed to fetch document');
    } finally {
      setLoading(false);
    }
  }, [collectionName, docId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
