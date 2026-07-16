import { createContext, useContext, useState, useCallback } from 'react';

const MessagesContext = createContext(null);

const INITIAL_MESSAGES = [
  {
    id: 'msg-001',
    from: 'Jean Mugabo',
    fromEmail: 'farmer@mahembe-coffee.rw',
    fromRole: 'farmer',
    to: 'admin',
    toEmail: 'admin@mahembe-coffee.rw',
    subject: 'Payment delay for May deliveries',
    body: 'Hello Admin, I delivered 200 kg of AA grade coffee on May 15th but have not received payment yet. Can you please check the status? Thank you.',
    timestamp: '2026-07-14T08:30:00',
    read: false,
    replies: [
      {
        id: 'reply-001',
        from: 'Jean-Paul Habimana',
        fromEmail: 'admin@mahembe-coffee.rw',
        body: 'Hello Jean, thank you for reaching out. We have verified your delivery and the payment has been processed. You should receive it via mobile money within 2 business days.',
        timestamp: '2026-07-14T10:15:00',
      },
    ],
  },
  {
    id: 'msg-002',
    from: 'Emmanuel Ndayisaba',
    fromEmail: 'farmer@mahembe-coffee.rw',
    fromRole: 'farmer',
    to: 'admin',
    toEmail: 'admin@mahembe-coffee.rw',
    subject: 'New coffee variety consultation',
    body: 'Dear Admin, I would like to discuss switching some of my farm to the BM 139 variety. Is the factory supporting this transition? What are the requirements?',
    timestamp: '2026-07-13T14:20:00',
    read: true,
    replies: [],
  },
  {
    id: 'msg-003',
    from: 'Epiphanie Mukamana',
    fromEmail: 'collection@mahembe-coffee.rw',
    fromRole: 'collection_officer',
    to: 'admin',
    toEmail: 'admin@mahembe-coffee.rw',
    subject: 'Collection center equipment request',
    body: 'Hi Admin, the Ruyanza Collection Point needs a new weighing scale. The current one is giving inaccurate readings. Can we request a replacement? The current readings are off by 2-3 kg.',
    timestamp: '2026-07-12T09:00:00',
    read: true,
    replies: [
      {
        id: 'reply-002',
        from: 'Jean-Paul Habimana',
        fromEmail: 'admin@mahembe-coffee.rw',
        body: 'Noted Epiphanie. I have approved the procurement. A new scale will be delivered to Ruyanza by end of this week.',
        timestamp: '2026-07-12T11:30:00',
      },
    ],
  },
  {
    id: 'msg-004',
    from: 'Arsene Nshimiyimana',
    fromEmail: 'accountant@mahembe-coffee.rw',
    fromRole: 'accountant',
    to: 'admin',
    toEmail: 'admin@mahembe-coffee.rw',
    subject: 'Monthly financial report ready',
    body: 'Admin, the June 2026 financial report is ready for review. Total revenue: RWF 12.5M, Expenses: RWF 8.2M. Please review and approve for distribution to the board.',
    timestamp: '2026-07-11T16:45:00',
    read: true,
    replies: [],
  },
  {
    id: 'msg-005',
    from: 'Marie Claire Uwimana',
    fromEmail: 'm.uwimana@mahembe-coffee.rw',
    fromRole: 'farmer',
    to: 'admin',
    toEmail: 'admin@mahembe-coffee.rw',
    subject: 'Thank you for the training program',
    body: 'Dear Admin, I wanted to thank you for organizing the coffee quality training last week. It was very helpful. I have already started applying the new sorting techniques on my farm.',
    timestamp: '2026-07-10T07:00:00',
    read: true,
    replies: [
      {
        id: 'reply-003',
        from: 'Jean-Paul Habimana',
        fromEmail: 'admin@mahembe-coffee.rw',
        body: 'Thank you Marie Claire! We are glad the training was useful. We plan to organize more sessions on post-harvest handling next month.',
        timestamp: '2026-07-10T09:20:00',
      },
    ],
  },
  {
    id: 'msg-006',
    from: 'Alexis Habimana',
    fromEmail: 'production@mahembe-coffee.rw',
    fromRole: 'production_officer',
    to: 'admin',
    toEmail: 'admin@mahembe-coffee.rw',
    subject: 'Machine maintenance schedule',
    body: 'Admin, the pulping machine is due for annual maintenance. I recommend scheduling it for next week during the low season. Estimated downtime: 3 days. Cost: RWF 1.8M.',
    timestamp: '2026-07-09T13:00:00',
    read: false,
    replies: [],
  },
];

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const sendMessage = useCallback((msg) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
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
      id: `reply-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...reply,
    };
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, replies: [...m.replies, newReply], read: true }
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

  const markAllAsRead = useCallback((filter) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (filter === 'inbox' && m.to === 'admin') return { ...m, read: true };
        if (filter === 'sent' && m.to !== 'admin') return { ...m, read: true };
        return m;
      })
    );
  }, []);

  const deleteMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const getUnreadCount = useCallback((userEmail, role) => {
    if (role === 'admin') {
      return messages.filter((m) => m.to === 'admin' && !m.read).length;
    }
    return messages.filter((m) => m.fromEmail === userEmail && !m.read).length;
  }, [messages]);

  const value = {
    messages,
    sendMessage,
    replyToMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    getUnreadCount,
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
