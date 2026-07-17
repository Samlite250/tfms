import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const MessagesContext = createContext(null);

let _firebaseAvailable = null;
async function isFirebaseAvailable() {
  if (_firebaseAvailable !== null) return _firebaseAvailable;
  try {
    const { auth } = await import('../firebase/config');
    const apiKey = auth?.app?.options?.apiKey || '';
    const projectId = auth?.app?.options?.projectId || '';
    _firebaseAvailable = apiKey && projectId && !apiKey.includes('demo-placeholder') && apiKey.length > 20;
  } catch { _firebaseAvailable = false; }
  return _firebaseAvailable;
}

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const unsubRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    isFirebaseAvailable().then((available) => {
      if (cancelled || !available) return;
      Promise.all([
        import('firebase/firestore'),
        import('../firebase/config'),
      ]).then(([{ collection, query, orderBy, onSnapshot }, { db }]) => {
        if (cancelled) return;
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        unsubRef.current = onSnapshot(q, (snap) => {
          if (!cancelled) setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }, () => { if (!cancelled) setMessages([]); });
      });
    });
    return () => {
      cancelled = true;
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    };
  }, []);

  const sendMessage = useCallback(async (msg) => {
    const newMsg = {
      ...msg,
      createdAt: new Date().toISOString(),
      read: false,
      replies: [],
    };
    if (await isFirebaseAvailable()) {
      const { collection: col, addDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      const docRef = await addDoc(col(db, 'messages'), newMsg);
      return { id: docRef.id, ...newMsg };
    }
    const localMsg = { id: `msg-${Date.now()}`, ...newMsg };
    setMessages((prev) => [localMsg, ...prev]);
    return localMsg;
  }, []);

  const replyToMessage = useCallback(async (messageId, reply) => {
    const newReply = {
      id: `reply-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...reply,
    };
    if (await isFirebaseAvailable()) {
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      await updateDoc(doc(db, 'messages', messageId), {
        replies: arrayUnion(newReply),
      });
      return newReply;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, replies: [...(m.replies || []), newReply] }
          : m
      )
    );
    return newReply;
  }, []);

  const markAsRead = useCallback(async (messageId) => {
    if (await isFirebaseAvailable()) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        await updateDoc(doc(db, 'messages', messageId), { read: true });
      } catch { /* ignore */ }
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  }, []);

  const deleteMessage = useCallback(async (messageId) => {
    if (await isFirebaseAvailable()) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        await deleteDoc(doc(db, 'messages', messageId));
      } catch { /* ignore */ }
    }
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const value = {
    messages,
    sendMessage,
    replyToMessage,
    markAsRead,
    deleteMessage,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
