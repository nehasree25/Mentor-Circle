import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  BookOpen,
  Send,
  ArrowLeft,
  Check,
  X,
  Clock,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { mentorshipService } from "../services/mentorshipService";
import { useAuth } from "../context/AuthContext";

// Inline avatar - no external dep needed
const AvatarIcon = ({ user = {}, size = "w-10 h-10" }) => {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500"];
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "?";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  const bg = colors[(user.id || 0) % colors.length];
  return (
    <div className={`${size} ${bg} rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0`}>
      {initials}
    </div>
  );
};

// ========================================================================
// Helpers
// ========================================================================

const fmt = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const statusBadge = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-600 border border-amber-200" },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  rejected: { label: "Declined", cls: "bg-rose-50 text-rose-600 border border-rose-200" },
};

// ========================================================================
// Components
// ========================================================================

const StatusBadge = ({ status }) => {
  const b = statusBadge[status] || statusBadge.pending;
  return (
    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${b.cls}`}>
      {b.label}
    </span>
  );
};

// Request card - guidance only
const RequestCard = ({ req, currentUserId, onAccept, onDecline, onOpenChat }) => {
  const navigate = useNavigate();
  const isMentor = req.mentor?.id === currentUserId;
  const canAct = isMentor && req.status === "pending";
  const hasConversation = req.status === "accepted";
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const sender = req.sender;
  const other = isMentor ? req.sender : req.mentor;

  const fullName = other
    ? `${other.first_name || ""} ${other.last_name || ""}`.trim() || other.username
    : "Unknown";

  const rejectionReasons = [
    "I am currently busy.",
    "I am unable to guide at this time.",
    "My expertise does not fully match this topic.",
    "I am already mentoring other learners."
  ];

  const handleDeclineSubmit = () => {
    if (!rejectReason.trim()) return;
    onDecline(req.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarIcon user={other || {}} size="w-10 h-10" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-navy truncate">{fullName}</p>
            <p className="text-[11.5px] text-textsecondary truncate">{req.circle?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={req.status} />
          <span className="text-[11px] text-[#94A3B8]">{fmt(req.created_at)}</span>
        </div>
      </div>

      {/* Topic / Subject */}
      <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-1.5">
        <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
          Subject
        </p>
        <p className="text-[13.5px] font-semibold text-navy">
          {req.subject}
        </p>
        {req.guidance_topic && (
          <p className="text-[12.5px] text-textsecondary">
            {req.guidance_topic}
          </p>
        )}
      </div>

      {/* Message */}
      {req.message && (
        <p className="text-[13px] text-[#475569] leading-relaxed border-l-2 border-[#BFDBFE] pl-3">
          "{req.message}"
        </p>
      )}

      {/* Rejection Reason */}
      {req.status === "rejected" && req.rejection_reason && (
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">
            Rejection Reason
          </p>
          <p className="text-[13px] text-red-800">{req.rejection_reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {canAct && (
          <>
            <button
              onClick={() => onAccept(req.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1a56db] hover:bg-[#1648c4] text-white text-[12.5px] font-semibold rounded-xl transition-colors"
            >
              <Check size={13} /> Accept
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 text-[12.5px] font-semibold rounded-xl transition-colors"
            >
              <X size={13} /> Decline
            </button>
          </>
        )}
        {hasConversation && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => onOpenChat(req)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12.5px] font-semibold rounded-xl transition-colors"
            >
              <BookOpen size={13} /> Open Chat
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => navigate(`/circles/${req.circle?.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12.5px] font-semibold rounded-xl transition-colors"
            >
              Go to Circle
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy">Reject Guidance Request</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Select a reason or write your own:</p>
                <div className="flex flex-col gap-2">
                  {rejectionReasons.map((reason, index) => (
                    <button
                      key={index}
                      onClick={() => setRejectReason(reason)}
                      className={`text-left px-4 py-2 rounded-lg border text-sm transition-colors ${rejectReason === reason ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or write your own reason:</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={3}
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Chat panel
const ChatPanel = ({ req, currentUserId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const convId = req?.conversation_id || req?.conversation?.id;

  const isMentor = req.mentor?.id === currentUserId;
  const other = isMentor ? req.sender : req.mentor;
  const otherName = other
    ? `${other.first_name || ""} ${other.last_name || ""}`.trim() || other.username
    : "Chat";

  const fetchMessages = useCallback(async () => {
    if (!convId) return;
    try {
      const data = await mentorshipService.getMessages(convId);
      const msgs = Array.isArray(data) ? data : data.results || [];
      setMessages(msgs);
    } catch {
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [convId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !convId) return;
    setSending(true);
    try {
      await mentorshipService.sendMessage(convId, text.trim());
      setText("");
      await fetchMessages();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-[#64748B] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <AvatarIcon user={other || {}} size="w-9 h-9" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-navy truncate">{otherName}</p>
          <p className="text-[11.5px] text-textsecondary truncate">
            {req.subject} · {req.circle?.name}
          </p>
        </div>
        <button onClick={fetchMessages} className="p-1.5 rounded-lg hover:bg-slate-200 text-[#64748B]">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#F8FAFC]">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-[#1a56db]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-textsecondary text-[13.5px]">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?.id === currentUserId || msg.is_own_message;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[72%] ${isOwn ? "order-2" : "order-1"}`}>
                  {!isOwn && (
                    <p className="text-[11px] text-[#94A3B8] mb-1 ml-1">
                      {msg.sender?.first_name || msg.sender?.username}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                      isOwn
                        ? "bg-[#1a56db] text-white rounded-br-sm"
                        : "bg-white border border-[#E2E8F0] text-navy rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10.5px] text-[#94A3B8] mt-1 ${isOwn ? "text-right" : "text-left"} ml-1 mr-1`}>
                    {fmt(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#E2E8F0] bg-white flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Type a message… (Enter to send)"
          className="flex-1 resize-none px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13.5px] focus:outline-none focus:border-[#1a56db] max-h-28 overflow-y-auto"
          style={{ minHeight: "42px" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-[#1a56db] hover:bg-[#1648c4] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

// ========================================================================
// Requests Panel
// ========================================================================

const RequestsPanel = ({ currentUserId, onOpenChat }) => {
  const [tab, setTab] = useState("received"); // received | sent
  const [filter, setFilter] = useState("pending"); // pending | accepted | rejected | all
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: tab, status: filter };
      const data = await mentorshipService.getMyGuidanceRequests(params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [tab, filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAccept = async (id) => {
    try {
      const response = await mentorshipService.acceptGuidanceRequest(id);
      toast.success("Request accepted");
      fetchItems();
      // Navigate to circle if circle_id is returned
      if (response.circle_id) {
        navigate(`/circles/${response.circle_id}`);
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to accept");
    }
  };

  const handleDecline = async (id, rejectionReason) => {
    try {
      await mentorshipService.rejectGuidanceRequest(id, rejectionReason);
      toast.success("Request declined");
      fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to decline");
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        {["received", "sent"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              tab === t
                ? "bg-[#1a56db] text-white"
                : "bg-[#F8FAFC] border border-[#E2E8F0] text-textsecondary hover:text-navy"
            }`}
          >
            {t === "received" ? "Received" : "Sent"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          {["pending", "accepted", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-slate-800 text-white"
                  : "text-textsecondary hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#1a56db]" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-14 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0]">
          <Clock size={28} className="text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[14px] text-textsecondary font-medium">No {filter} requests</p>
          <p className="text-[12.5px] text-[#94A3B8] mt-1">
            {tab === "received"
              ? "Requests others send you will appear here."
              : "Requests you send will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              currentUserId={currentUserId}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ========================================================================
// Main Page
// ========================================================================

const Requests = () => {
  const { user } = useAuth();
  const [chatReq, setChatReq] = useState(null);

  const openChat = (req) => {
    setChatReq(req);
  };

  const closeChat = () => {
    setChatReq(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-8 py-6">
        <h1 className="text-3xl font-bold text-navy mb-1">Requests</h1>
        <p className="text-textsecondary text-[14px]">
          Manage guidance requests and chat with your connections.
        </p>
      </div>

      {/* Content */}
      {chatReq ? (
        <ChatPanel
          req={chatReq}
          currentUserId={user?.id}
          onBack={closeChat}
        />
      ) : (
        <RequestsPanel
          currentUserId={user?.id}
          onOpenChat={openChat}
        />
      )}
    </div>
  );
};

export default Requests;
