import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../firebase/config';

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) return;

    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setMessages(data.map((row) => ({
            id: row.id,
            from: row.from_name,
            fromEmail: row.from_email,
            fromRole: row.from_role,
            to: row.to_name,
            toEmail: row.to_email,
            subject: row.subject,
            body: row.body,
            read: row.read,
            createdAt: row.created_at,
            replies: row.replies || [],
          })));
        }
      });

    channelRef.current = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          const msg = {
            id: row.id,
            from: row.from_name,
            fromEmail: row.from_email,
            fromRole: row.from_role,
            to: row.to_name,
            toEmail: row.to_email,
            subject: row.subject,
            body: row.body,
            read: row.read,
            createdAt: row.created_at,
            replies: row.replies || [],
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [msg, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === row.id
                ? { ...m, read: row.read, body: row.body || m.body }
                : m
            )
          );
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback(async (msg) => {
    const newMsg = {
      from_name: msg.from || '',
      from_email: msg.fromEmail || '',
      from_role: msg.fromRole || '',
      to_name: msg.to || '',
      to_email: msg.toEmail || '',
      subject: msg.subject || '',
      body: msg.body || '',
      read: false,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(newMsg)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      from: data.from_name,
      fromEmail: data.from_email,
      fromRole: data.from_role,
      to: data.to_name,
      toEmail: data.to_email,
      subject: data.subject,
      body: data.body,
      read: data.read,
      createdAt: data.created_at,
      replies: [],
    };
  }, []);

  const replyToMessage = useCallback(async (messageId, reply) => {
    const newReply = {
      id: `reply-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...reply,
    };
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
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  }, []);

  const deleteMessage = useCallback(async (messageId) => {
    await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

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
