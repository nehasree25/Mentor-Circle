import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { mentorshipService } from "../services/mentorshipService";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/common/PageHeader";

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
const RequestCard = ({ req, currentUserId, onAccept, onDecline }) => {
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

// ========================================================================
// Requests Panel
// ========================================================================

const RequestsPanel = ({ currentUserId, type }) => {
  const [filter, setFilter] = useState("pending"); // pending | accepted | rejected | all
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type, status: filter };
      const data = await mentorshipService.getMyGuidanceRequests(params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [type, filter]);

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
      {/* Filters */}
      <div className="flex items-center gap-2">
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
            {type === "received"
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
  const { user, profile } = useAuth();
  const isMentor = profile?.role === "mentor";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <PageHeader 
        title="Requests" 
        subtitle="Manage guidance requests." 
      />

      {/* Content */}
      <RequestsPanel
        currentUserId={user?.id}
        type={isMentor ? "received" : "sent"}
      />
    </div>
  );
};

export default Requests;
