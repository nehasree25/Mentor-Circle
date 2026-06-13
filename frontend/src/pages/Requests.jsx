import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { mentorshipService } from "../services/mentorshipService";
import toast from "react-hot-toast";
import { Check, X, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import Avatar from "../components/common/Avatar";

export default function Requests() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("guidance");
  const [requestType, setRequestType] = useState("received"); // 'received' or 'sent'
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const isMentor = user?.profile?.role === "mentor";

  useEffect(() => {
    fetchRequests();
  }, [activeTab, requestType, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeTab === "guidance") {
        const data = await mentorshipService.getMyGuidanceRequests({
          type: requestType,
          status: statusFilter,
        });
        setGuidanceRequests(data.results || []);
      } else {
        const data = await mentorshipService.getMyCollaborationRequests({
          type: requestType,
          status: statusFilter,
        });
        setCollaborationRequests(data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptGuidance = async (requestId) => {
    try {
      const response = await mentorshipService.acceptGuidanceRequest(requestId);
      toast.success("Guidance request accepted! Conversation created.");
      fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to accept request");
    }
  };

  const handleRejectGuidance = async (requestId) => {
    try {
      await mentorshipService.rejectGuidanceRequest(requestId);
      toast.success("Guidance request rejected");
      fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reject request");
    }
  };

  const handleAcceptCollaboration = async (requestId) => {
    try {
      const response = await mentorshipService.acceptCollaborationRequest(requestId);
      toast.success("Collaboration request accepted! Conversation created.");
      fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to accept request");
    }
  };

  const handleRejectCollaboration = async (requestId) => {
    try {
      await mentorshipService.rejectCollaborationRequest(requestId);
      toast.success("Collaboration request rejected");
      fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reject request");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">My Requests</h1>
        <p className="text-textsecondary">
          Manage your mentorship and collaboration requests
        </p>
      </div>

      {/* Tabs: Guidance vs Collaboration */}
      <div className="rounded-3xl border border-borderline bg-white shadow-soft">
        <div className="border-b border-borderline">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("guidance")}
              className={`flex-1 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === "guidance"
                  ? "border-royal text-royal"
                  : "border-transparent text-textsecondary hover:text-navy"
              }`}
            >
              <MessageSquare className="inline mr-2" size={18} />
              Guidance Requests
            </button>
            <button
              onClick={() => setActiveTab("collaboration")}
              className={`flex-1 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === "collaboration"
                  ? "border-royal text-royal"
                  : "border-transparent text-textsecondary hover:text-navy"
              }`}
            >
              <MessageSquare className="inline mr-2" size={18} />
              Collaboration Requests
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Sub-tabs: Received vs Sent */}
          <div className="flex gap-2 mb-6">
            {activeTab === "guidance" && isMentor && (
              <>
                <button
                  onClick={() => setRequestType("received")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    requestType === "received"
                      ? "bg-royal text-white"
                      : "bg-appbg text-navy hover:bg-softblue"
                  }`}
                >
                  Received (As Mentor)
                </button>
                <button
                  onClick={() => setRequestType("sent")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    requestType === "sent"
                      ? "bg-royal text-white"
                      : "bg-appbg text-navy hover:bg-softblue"
                  }`}
                >
                  Sent (As Student)
                </button>
              </>
            )}

            {activeTab === "collaboration" && (
              <>
                <button
                  onClick={() => setRequestType("received")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    requestType === "received"
                      ? "bg-royal text-white"
                      : "bg-appbg text-navy hover:bg-softblue"
                  }`}
                >
                  Received
                </button>
                <button
                  onClick={() => setRequestType("sent")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    requestType === "sent"
                      ? "bg-royal text-white"
                      : "bg-appbg text-navy hover:bg-softblue"
                  }`}
                >
                  Sent
                </button>
              </>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["pending", "accepted", "rejected", "all"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  statusFilter === status
                    ? "bg-royal text-white"
                    : "bg-white text-navy border border-borderline hover:bg-softblue"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Request List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-textsecondary">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "guidance" ? (
                guidanceRequests.length > 0 ? (
                  guidanceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-borderline bg-white p-6 shadow-soft hover:shadow-glow transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          user={requestType === "received" ? request.sender : request.mentor}
                          size="w-12 h-12"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-navy text-lg">
                                {requestType === "received"
                                  ? `${request.sender.first_name} ${request.sender.last_name}`
                                  : `${request.mentor.first_name} ${request.mentor.last_name}`}
                              </h3>
                              <p className="text-sm text-textsecondary">
                                {requestType === "received" ? "Student" : "Mentor"} •{" "}
                                {request.circle.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                {request.status.charAt(0).toUpperCase() +
                                  request.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div>
                              <span className="font-semibold text-navy">Subject: </span>
                              <span className="text-textsecondary">{request.subject}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-navy">Topic: </span>
                              <span className="text-textsecondary">{request.guidance_topic}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-navy">Message: </span>
                              <p className="text-textsecondary mt-1">{request.message}</p>
                            </div>
                            <div className="text-sm text-textsecondary">
                              {new Date(request.created_at).toLocaleString()}
                            </div>
                          </div>

                          {requestType === "received" && request.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptGuidance(request.id)}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all"
                              >
                                <Check size={18} />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectGuidance(request.id)}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-all"
                              >
                                <X size={18} />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 rounded-2xl bg-appbg">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-textsecondary" />
                    <h3 className="font-semibold text-navy mb-2">No guidance requests</h3>
                    <p className="text-textsecondary">
                      {requestType === "received"
                        ? "You haven't received any guidance requests yet"
                        : "You haven't sent any guidance requests yet"}
                    </p>
                  </div>
                )
              ) : collaborationRequests.length > 0 ? (
                collaborationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-borderline bg-white p-6 shadow-soft hover:shadow-glow transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar
                        user={requestType === "received" ? request.sender : request.receiver}
                        size="w-12 h-12"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-navy text-lg">
                              {requestType === "received"
                                ? `${request.sender.first_name} ${request.sender.last_name}`
                                : `${request.receiver.first_name} ${request.receiver.last_name}`}
                            </h3>
                            <p className="text-sm text-textsecondary">
                              Peer • {request.circle.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div>
                            <span className="font-semibold text-navy">Project: </span>
                            <span className="text-textsecondary">{request.project_topic}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-navy">Goal: </span>
                            <span className="text-textsecondary">
                              {request.collaboration_goal}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-navy">Message: </span>
                            <p className="text-textsecondary mt-1">{request.message}</p>
                          </div>
                          <div className="text-sm text-textsecondary">
                            {new Date(request.created_at).toLocaleString()}
                          </div>
                        </div>

                        {requestType === "received" && request.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptCollaboration(request.id)}
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all"
                            >
                              <Check size={18} />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectCollaboration(request.id)}
                              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-all"
                            >
                              <X size={18} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 rounded-2xl bg-appbg">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-textsecondary" />
                  <h3 className="font-semibold text-navy mb-2">No collaboration requests</h3>
                  <p className="text-textsecondary">
                    {requestType === "received"
                      ? "You haven't received any collaboration requests yet"
                      : "You haven't sent any collaboration requests yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
