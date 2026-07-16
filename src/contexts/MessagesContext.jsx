import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const MessagesContext = createContext(null);

const STORAGE_KEY = 'coms_messages';

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveMessages(msgs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch { /* ignore */ }
}

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState(loadMessages);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const sendMessage = useCallback((msg) => {
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
      replies: [],
      ...msg,
    };
    setMessages((prev) => [newMsg, ...prev]);
    return newMsg;
  }, []);

  const replyToMessage = useCallback((messageId, reply) => {
    const newReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...reply,
    };
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, replies: [...(m.replies || []), newReply], read: true }
          : m
      )
    );
    return newReply;
  }, []);

  const markAsRead = useCallback((messageId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  }, []);

  const deleteMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const value = {
    messages,
    sendMessage,
    replyToMessage,
    markAsRead,
    markAllAsRead,
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
