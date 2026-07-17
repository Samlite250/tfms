import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Inbox, Mail, Search, Clock, Reply,
  Trash2, ChevronLeft, CheckCircle2, Circle, Paperclip, ArrowRight,
  ExternalLink,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useMessages } from "../../contexts/MessagesContext";
import { useAuth } from "../../contexts/AuthContext";
import { contactMessagesService } from "../../firebase/firestoreService";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function MessagingPage() {
  const { userProfile } = useAuth();
  const { messages, sendMessage, replyToMessage, markAsRead, markAllAsRead, deleteMessage } = useMessages();
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const userEmail = userProfile?.email || "";
  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    if (activeTab !== "contact") return;
    let unsub = null;
    async function fetchContactMessages() {
      setContactLoading(true);
      try {
        const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore");
        const { db } = await import("../../firebase/config");
        const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(q, (snapshot) => {
          setContactMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
          setContactLoading(false);
        }, () => {
          setContactMessages([]);
          setContactLoading(false);
        });
      } catch {
        try {
          const data = await contactMessagesService.getAll({ limitCount: 100 });
          setContactMessages(Array.isArray(data) ? data : []);
        } catch {
          setContactMessages([]);
        }
        setContactLoading(false);
      }
    }
    fetchContactMessages();
    return () => { if (unsub) unsub(); };
  }, [activeTab]);

  async function handleMarkContactRead(id) {
    try {
      await contactMessagesService.update(id, { status: "read" });
      setContactMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "read" } : m));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function handleDeleteContact(id) {
    try {
      await contactMessagesService.delete(id);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err) {
      console.error("Failed to delete contact message:", err);
    }
  }

  const inbox = useMemo(() => {
    return messages
      .filter((m) => m.toEmail === userEmail)
      .filter((m) => !search || m.subject.toLowerCase().includes(search.toLowerCase()) || m.from.toLowerCase().includes(search.toLowerCase()));
  }, [messages, userEmail, search]);

  const sent = useMemo(() => {
    return messages
      .filter((m) => m.fromEmail === userEmail)
      .filter((m) => !search || m.subject.toLowerCase().includes(search.toLowerCase()) || m.to.toLowerCase().includes(search.toLowerCase()));
  }, [messages, userEmail, search]);

  const unreadCount = useMemo(() => inbox.filter((m) => !m.read).length, [inbox]);
  const currentList = activeTab === "inbox" ? inbox : sent;

  function handleSendReply() {
    if (!replyText.trim() || !selectedMsg) return;
    replyToMessage(selectedMsg.id, {
      from: userProfile?.displayName || "User",
      fromEmail: userEmail,
      body: replyText.trim(),
    });
    setReplyText("");
    setSelectedMsg((prev) => ({
      ...prev,
      replies: [
        ...prev.replies,
        { id: `temp-${Date.now()}`, from: userProfile?.displayName || "User", fromEmail: userEmail, body: replyText.trim(), timestamp: new Date().toISOString() },
      ],
    }));
  }

  function handleCompose() {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    sendMessage({
      from: userProfile?.displayName || "User",
      fromEmail: userEmail,
      fromRole: userProfile?.role || "user",
      to: "Admin",
      toEmail: "admin@mahembe-coffee.rw",
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    });
    setComposeSubject("");
    setComposeBody("");
    setShowCompose(false);
  }

  function openMessage(msg) {
    setSelectedMsg(msg);
    if (!msg.read) markAsRead(msg.id);
  }

  return (
    <motion.div className="min-h-screen space-y-6 p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">Messages</h1>
            <p className="text-sm text-text-secondary">Communicate with administration</p>
          </div>
        </div>
        <Button icon={Send} onClick={() => { setShowCompose(true); setSelectedMsg(null); }}>
          Compose Message
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Tabs + Message List */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card padding="none">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { key: "inbox", label: "Inbox", icon: Inbox, count: unreadCount },
                { key: "sent", label: "Sent", icon: Send },
                ...(isAdmin ? [{ key: "contact", label: "Contact Us", icon: Mail, count: contactMessages.filter((m) => m.status === "new").length }] : []),
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSelectedMsg(null); setSearch(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
                    activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full bg-primary text-white px-1">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            {/* Message List */}
            <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
              {activeTab === "contact" ? (
                contactLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center gap-2 text-text-secondary">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </div>
                  </div>
                ) : contactMessages.length === 0 ? (
                  <div className="p-8">
                    <EmptyState icon={Mail} title="No contact messages" description="No one has used the contact form yet." />
                  </div>
                ) : (
                  contactMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => { setSelectedContact(msg); if (msg.status === "new") handleMarkContactRead(msg.id); }}
                      className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer ${
                        selectedContact?.id === msg.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          msg.status === "new" ? "bg-primary/15 text-primary" : "bg-gray-100 text-text-secondary"
                        }`}>
                          {getInitials(msg.name || "Anonymous")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${msg.status === "new" ? "font-semibold text-text-primary" : "font-normal text-text-primary"}`}>
                              {msg.name || "Anonymous"}
                            </p>
                            {msg.status === "new" && <Circle size={8} className="fill-primary text-primary shrink-0" />}
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${msg.status === "new" ? "font-medium text-text-primary" : "text-text-secondary"}`}>
                            {msg.subject}
                          </p>
                          <p className="text-xs text-text-secondary/60 mt-0.5">{timeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )
              ) : currentList.length === 0 ? (
                <div className="p-8">
                  <EmptyState icon={Mail} title="No messages" description={activeTab === "inbox" ? "Your inbox is empty." : "No sent messages."} />
                </div>
              ) : (
                currentList.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer ${
                      selectedMsg?.id === msg.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.read ? "bg-gray-100 text-text-secondary" : "bg-primary/15 text-primary"
                      }`}>
                        {getInitials(activeTab === "inbox" ? msg.from : msg.to)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${msg.read ? "font-normal text-text-primary" : "font-semibold text-text-primary"}`}>
                            {activeTab === "inbox" ? msg.from : msg.to}
                          </p>
                          {!msg.read && <Circle size={8} className="fill-primary text-primary shrink-0" />}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${msg.read ? "text-text-secondary" : "font-medium text-text-primary"}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-text-secondary/60 mt-0.5">{timeAgo(msg.timestamp)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Right Panel: Message Detail / Compose */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedContact && activeTab === "contact" ? (
              <motion.div key="contact-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card padding="none">
                  <div className="p-5 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button onClick={() => setSelectedContact(null)} className="mt-1 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer lg:hidden">
                          <ChevronLeft size={18} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{getInitials(selectedContact.name || "A")}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-text-primary">{selectedContact.name}</h3>
                            <Badge variant={selectedContact.status === "new" ? "info" : "success"}>
                              {selectedContact.status === "new" ? "New" : "Read"}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{selectedContact.email}</p>
                          <p className="text-xs text-text-secondary/60 mt-0.5">{formatDateTime(selectedContact.createdAt)}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteContact(selectedContact.id)} className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary mt-4">{selectedContact.subject}</h2>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                  <div className="p-5 border-t border-border bg-gray-50/50">
                    <p className="text-xs text-text-secondary">
                      This message was submitted via the website contact form. To respond, reply to <span className="font-medium text-text-primary">{selectedContact.email}</span> directly.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : showCompose ? (
              <motion.div key="compose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card
                  header={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send size={20} className="text-primary" />
                        <h3 className="text-base font-semibold text-text-primary">New Message to Admin</h3>
                      </div>
                      <button onClick={() => setShowCompose(false)} className="text-sm text-text-secondary hover:text-text-primary cursor-pointer">Cancel</button>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-1.5 block">Subject</label>
                      <input
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="Message subject"
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-1.5 block">Message</label>
                      <textarea
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Type your message here..."
                        rows={6}
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
                      <Button icon={Send} onClick={handleCompose} disabled={!composeSubject.trim() || !composeBody.trim()}>
                        Send Message
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : selectedMsg ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card padding="none">
                  {/* Message Header */}
                  <div className="p-5 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button onClick={() => setSelectedMsg(null)} className="mt-1 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer lg:hidden">
                          <ChevronLeft size={18} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{getInitials(selectedMsg.from)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-text-primary">{selectedMsg.from}</h3>
                            <Badge variant="default" className="text-[10px]">{selectedMsg.fromRole}</Badge>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{selectedMsg.fromEmail}</p>
                          <p className="text-xs text-text-secondary/60 mt-0.5">{formatDateTime(selectedMsg.timestamp)}</p>
                        </div>
                      </div>
                      <button onClick={() => { deleteMessage(selectedMsg.id); setSelectedMsg(null); }} className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary mt-4">{selectedMsg.subject}</h2>
                  </div>

                  {/* Message Body */}
                  <div className="p-5">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{selectedMsg.body}</p>
                  </div>

                  {/* Replies */}
                  {selectedMsg.replies.length > 0 && (
                    <div className="border-t border-border">
                      <div className="px-5 py-3 bg-gray-50/80 border-b border-border">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          {selectedMsg.replies.length} {selectedMsg.replies.length === 1 ? "Reply" : "Replies"}
                        </p>
                      </div>
                      <div className="divide-y divide-border">
                        {selectedMsg.replies.map((reply) => (
                          <div key={reply.id} className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary">{getInitials(reply.from)}</span>
                              </div>
                              <span className="text-sm font-medium text-text-primary">{reply.from}</span>
                              <span className="text-xs text-text-secondary/60">{formatDateTime(reply.timestamp)}</span>
                            </div>
                            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap ml-9">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Box */}
                  <div className="p-5 border-t border-border bg-gray-50/50">
                    <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Reply</p>
                    <div className="flex gap-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                        className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button icon={Reply} onClick={handleSendReply} disabled={!replyText.trim()} size="sm">
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <EmptyState
                    icon={MessageSquare}
                    title={activeTab === "contact" ? "Select a contact message" : "Select a message"}
                    description={activeTab === "contact" ? "Choose a contact form submission to view its contents." : "Choose a message from the list to view its contents, or compose a new message to admin."}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
