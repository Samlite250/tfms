import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Search, Trash2, ChevronLeft, Circle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useMessages } from "../../contexts/MessagesContext";
import { useAuth } from "../../contexts/AuthContext";
import { contactMessagesService } from "../../firebase/firestoreService";

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function MessagingPage() {
  const { userProfile } = useAuth();
  const { messages, sendMessage, replyToMessage, markAsRead, deleteMessage } = useMessages();
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const messagesEndRef = useRef(null);
  const userEmail = userProfile?.email || "";
  const userName = userProfile?.displayName || "User";
  const userRole = userProfile?.role || "user";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (activeTab !== "contact") return;
    let cancelled = false;
    let channel;
    async function fetchContactMessages() {
      setContactLoading(true);
      try {
        const { supabase } = await import("../../firebase/config");
        const { data: rows } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });
        if (!cancelled) {
          setContactMessages(rows || []);
          setContactLoading(false);
        }
        channel = supabase
          .channel("contact-messages-realtime")
          .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, (payload) => {
            if (cancelled) return;
            if (payload.eventType === "INSERT") {
              setContactMessages((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setContactMessages((prev) => prev.map((m) => m.id === payload.new.id ? payload.new : m));
            } else if (payload.eventType === "DELETE") {
              setContactMessages((prev) => prev.filter((m) => m.id !== payload.old?.id));
            }
          })
          .subscribe();
      } catch {
        if (!cancelled) setContactLoading(false);
      }
    }
    fetchContactMessages();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMsg]);

  const myConversations = useMemo(() => {
    const convMap = new Map();
    messages.forEach((m) => {
      const isMine = isAdmin || m.fromEmail === userEmail || m.toEmail === userEmail;
      if (!isMine) return;
      const otherEmail = m.fromEmail === userEmail ? m.toEmail : m.fromEmail;
      const otherName = m.fromEmail === userEmail ? m.to : m.from;
      const key = m.subject || otherEmail;
      if (!convMap.has(key) || new Date(m.createdAt) > new Date(convMap.get(key).createdAt)) {
        convMap.set(key, { ...m, otherName, otherEmail });
      }
    });
    const list = Array.from(convMap.values());
    if (search) {
      const s = search.toLowerCase();
      return list.filter((m) =>
        (m.subject || "").toLowerCase().includes(s) ||
        (m.otherName || "").toLowerCase().includes(s) ||
        (m.from || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [messages, userEmail, search, isAdmin]);

  const unreadCount = useMemo(
    () => isAdmin
      ? messages.filter((m) => !m.read).length
      : myConversations.filter((m) => m.toEmail === userEmail && !m.read).length,
    [myConversations, messages, userEmail, isAdmin]
  );

  const threadMessages = useMemo(() => {
    if (!selectedMsg) return [];
    const other = selectedMsg.otherEmail;
    return messages
      .filter((m) => m.subject === selectedMsg.subject)
      .filter((m) => {
        if (isAdmin) return true;
        const iAmSender = m.fromEmail === userEmail;
        const iAmRecipient = m.toEmail === userEmail;
        if (!iAmSender && !iAmRecipient) return false;
        if (!other) return true;
        return m.fromEmail === other || m.toEmail === other;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [selectedMsg, messages, userEmail, isAdmin]);

  function openConversation(msg) {
    setSelectedMsg(msg);
    setShowCompose(false);
    setSelectedContact(null);
    if (!msg.read) markAsRead(msg.id);
  }

  async function handleSendReply() {
    if (!replyText.trim() || !selectedMsg) return;
    await sendMessage({
      from: userName,
      fromEmail: userEmail,
      fromRole: userRole,
      to: selectedMsg.fromEmail === userEmail ? selectedMsg.to : selectedMsg.from,
      toEmail: selectedMsg.fromEmail === userEmail ? selectedMsg.toEmail : selectedMsg.fromEmail,
      subject: selectedMsg.subject,
      body: replyText.trim(),
    });
    setReplyText("");
  }

  async function handleCompose() {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    let toEmail = composeTo;
    let toName = composeTo ? composeTo.split("@")[0] : (isAdmin ? "Farmer" : "Admin");
    if (!toEmail && !isAdmin) {
      try {
        const { supabase } = await import("../../firebase/config");
        const { data: adminUsers } = await supabase
          .from("users")
          .select("email, display_name")
          .eq("role", "admin")
          .eq("status", "active")
          .limit(1);
        if (adminUsers && adminUsers.length > 0) {
          toEmail = adminUsers[0].email;
          toName = adminUsers[0].display_name || "Admin";
        }
      } catch { /* ignore */ }
    }
    if (!toEmail) toEmail = "admin@mahembe-coffee.rw";
    await sendMessage({
      from: userName,
      fromEmail: userEmail,
      fromRole: userRole,
      to: toName,
      toEmail,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    });
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setShowCompose(false);
  }

  async function handleMarkContactRead(id) {
    try {
      await contactMessagesService.update(id, { status: "read" });
      setContactMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "read" } : m));
    } catch (err) { console.error(err); }
  }

  async function handleDeleteContact(id) {
    try {
      await contactMessagesService.delete(id);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err) { console.error(err); }
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">Messages</h1>
              <p className="text-sm text-text-secondary">
                {isAdmin ? "Communicate with farmers and staff" : "Communicate with administration"}
              </p>
            </div>
          </div>
          <Button icon={Send} onClick={() => { setShowCompose(true); setSelectedMsg(null); setSelectedContact(null); }}>
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card padding="none">
              <div className="flex border-b border-border">
                {[
                  { key: "inbox", label: "Messages", count: unreadCount },
                  ...(isAdmin ? [{ key: "contact", label: "Contact Us", count: contactMessages.filter((m) => m.status === "new").length }] : []),
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSelectedMsg(null); setSelectedContact(null); setSearch(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
                      activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full bg-primary text-white px-1">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                {activeTab === "contact" ? (
                  contactLoading ? (
                    <div className="p-8 text-center text-text-secondary text-sm">Loading...</div>
                  ) : contactMessages.length === 0 ? (
                    <div className="p-8"><EmptyState icon={MessageSquare} title="No contact messages" description="No submissions yet." /></div>
                  ) : (
                    contactMessages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => { setSelectedContact(msg); setSelectedMsg(null); setShowCompose(false); if (msg.status === "new") handleMarkContactRead(msg.id); }}
                        className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer ${selectedContact?.id === msg.id ? "bg-primary/10" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.status === "new" ? "bg-primary/15 text-primary" : "bg-gray-100 text-text-secondary"}`}>
                            {getInitials(msg.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm truncate ${msg.status === "new" ? "font-semibold" : ""}`}>{msg.name}</p>
                              {msg.status === "new" && <Circle size={8} className="fill-primary text-primary shrink-0" />}
                            </div>
                            <p className="text-xs truncate mt-0.5 text-text-secondary">{msg.subject}</p>
                            <p className="text-xs text-text-secondary/60 mt-0.5">{timeAgo(msg.createdAt)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )
                ) : myConversations.length === 0 ? (
                  <div className="p-8"><EmptyState icon={MessageSquare} title="No messages" description="Start a conversation with admin." /></div>
                ) : (
                  myConversations.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => openConversation(msg)}
                      className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer ${selectedMsg?.id === msg.id ? "bg-primary/10" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.toEmail === userEmail && !msg.read ? "bg-primary/15 text-primary" : "bg-gray-100 text-text-secondary"}`}>
                          {getInitials(msg.otherName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${msg.toEmail === userEmail && !msg.read ? "font-semibold" : ""}`}>{msg.otherName || msg.from}</p>
                            {msg.toEmail === userEmail && !msg.read && <Circle size={8} className="fill-primary text-primary shrink-0" />}
                          </div>
                          <p className="text-xs truncate mt-0.5 text-text-secondary">{msg.subject}</p>
                          <p className="text-xs text-text-secondary/60 mt-0.5">{timeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {showCompose ? (
                <motion.div key="compose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-text-primary">New Message</h3>
                      <button onClick={() => setShowCompose(false)} className="text-sm text-text-secondary hover:text-text-primary cursor-pointer">Cancel</button>
                    </div>
                    <div className="space-y-4">
                      {isAdmin && (
                        <div>
                          <label className="text-sm font-medium text-text-primary mb-1.5 block">To (email)</label>
                          <input
                            type="email"
                            value={composeTo}
                            onChange={(e) => setComposeTo(e.target.value)}
                            placeholder="recipient@email.com"
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-1.5 block">Subject</label>
                        <input
                          type="text"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="What's this about?"
                          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-1.5 block">Message</label>
                        <textarea
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          placeholder="Type your message..."
                          rows={5}
                          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
                        <Button icon={Send} onClick={handleCompose} disabled={!composeSubject.trim() || !composeBody.trim()}>Send</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : selectedContact && activeTab === "contact" ? (
                <motion.div key="contact-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card padding="none">
                    <div className="p-5 border-b border-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">{getInitials(selectedContact.name)}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-text-primary">{selectedContact.name}</h3>
                              <Badge variant={selectedContact.status === "new" ? "info" : "success"}>{selectedContact.status === "new" ? "New" : "Read"}</Badge>
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
                      <p className="text-xs text-text-secondary">Submitted via the website contact form. Reply to <span className="font-medium text-text-primary">{selectedContact.email}</span> directly.</p>
                    </div>
                  </Card>
                </motion.div>
              ) : selectedMsg ? (
                <motion.div key="thread" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card padding="none">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{getInitials(selectedMsg.otherName || selectedMsg.from)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{selectedMsg.otherName || selectedMsg.from}</h3>
                          <p className="text-xs text-text-secondary">{selectedMsg.subject}</p>
                        </div>
                      </div>
                      <button onClick={() => { deleteMessage(selectedMsg.id); setSelectedMsg(null); }} className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                      {threadMessages.map((msg) => {
                        const isMe = msg.fromEmail === userEmail;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? "bg-primary text-white" : "bg-gray-100 text-text-primary"}`}>
                              <p className={`text-xs font-medium mb-1 ${isMe ? "text-white/80" : "text-text-secondary"}`}>{msg.from}</p>
                              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                              <p className={`text-[10px] mt-1.5 ${isMe ? "text-white/60" : "text-text-secondary/60"}`}>{timeAgo(msg.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-border bg-gray-50/50">
                      <div className="flex gap-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                          placeholder="Type a reply..."
                          rows={2}
                          className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                        />
                        <Button icon={Send} onClick={handleSendReply} disabled={!replyText.trim()} className="self-end">Send</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <EmptyState
                      icon={MessageSquare}
                      title="Select a conversation"
                      description={activeTab === "contact" ? "Choose a contact form submission to view." : "Choose a message or start a new conversation."}
                    />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
