import React, { useState } from "react";
import { X, Users, Send, CheckCircle, MessageSquare, User } from "lucide-react";
import { mentorshipService } from "../../services/mentorshipService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export function PeerDetailsModal({ peer, circleId, isOpen, onClose, onSuccess }) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [projectTopic, setProjectTopic] = useState("");
  const [collaborationGoal, setCollaborationGoal] = useState("");

  if (!isOpen || !peer) return null;

  const handleSendRequest = async () => {
    if (!circleId) {
      toast.error("Circle context is required to send a collaboration request");
      return;
    }
    setIsSending(true);
    try {
      await mentorshipService.createCollaborationRequest(circleId, peer.id, {
        project_topic: projectTopic || "Collaboration",
        collaboration_goal: collaborationGoal || "Peer collaboration",
        message,
      });
      toast.success("Collaboration request sent!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await mentorshipService.acceptCollaborationRequest(requestId);
      toast.success("Collaboration request accepted!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to accept request");
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await mentorshipService.rejectCollaborationRequest(requestId);
      toast.success("Collaboration request declined.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to decline request");
    }
  };

  const getActionButtons = () => {
    switch (peer.collaboration_status) {
      case "collaborators":
        return (
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-3 font-semibold">
            <CheckCircle size={20} />
            Connected
          </button>
        );
      case "request_sent":
        return (
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-200 text-gray-600 py-3 font-semibold cursor-not-allowed">
            Request Sent
          </button>
        );
      case "request_received":
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleAccept(peer.pending_request_id)}
              className="flex-1 rounded-xl bg-royal text-white py-3 font-semibold hover:bg-darkblue transition-all"
            >
              Accept
            </button>
            <button
              onClick={() => handleDecline(peer.pending_request_id)}
              className="flex-1 rounded-xl border border-borderline py-3 font-semibold hover:bg-appbg transition-all"
            >
              Decline
            </button>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <input
              value={projectTopic}
              onChange={(e) => setProjectTopic(e.target.value)}
              placeholder="Project topic (required)"
              className="w-full rounded-xl border border-borderline p-3"
            />
            <input
              value={collaborationGoal}
              onChange={(e) => setCollaborationGoal(e.target.value)}
              placeholder="Collaboration goal (required)"
              className="w-full rounded-xl border border-borderline p-3"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message (optional)"
              className="w-full rounded-xl border border-borderline p-3 resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendRequest}
                disabled={isSending || !projectTopic.trim() || !collaborationGoal.trim()}
                className="flex-1 rounded-xl bg-royal hover:bg-darkblue text-white py-3 font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {isSending ? "Sending..." : "Send Collaboration Request"}
              </button>
              <button className="px-4 rounded-xl border border-borderline py-3 font-semibold flex items-center justify-center">
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white p-6 border-b border-borderline flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">Peer Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-softblue rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-softblue flex items-center justify-center">
              <User size={32} className="text-royal" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy">
                {peer.first_name || peer.last_name
                  ? `${peer.first_name || ""} ${peer.last_name || ""}`.trim()
                  : peer.username}
              </h3>
              <p className="text-textsecondary mt-1">@{peer.username}</p>
            </div>
          </div>

          {/* Bio */}
          {peer.profile?.bio && (
            <div>
              <h4 className="font-semibold text-navy mb-2">About</h4>
              <p className="text-textsecondary">{peer.profile.bio}</p>
            </div>
          )}

          {/* Domain */}
          {peer.profile?.domain && (
            <div>
              <h4 className="font-semibold text-navy mb-2">Domain</h4>
              <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                {peer.profile.domain}
              </span>
            </div>
          )}

          {/* Interests */}
          {peer.profile?.interests && peer.profile.interests.length > 0 && (
            <div>
              <h4 className="font-semibold text-navy mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {(typeof peer.profile.interests === "string"
                  ? peer.profile.interests.split(",").map(s => s.trim()).filter(Boolean)
                  : peer.profile.interests
                ).map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-softblue text-royal rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {peer.profile?.skills && peer.profile.skills.length > 0 && (
            <div>
              <h4 className="font-semibold text-navy mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(typeof peer.profile.skills === "string"
                  ? peer.profile.skills.split(",").map(s => s.trim()).filter(Boolean)
                  : peer.profile.skills
                ).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Circles */}
          {peer.common_circles?.length > 0 && (
            <div>
              <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                <Users size={20} />
                {peer.common_circles.length} Common Circles
              </h4>
              <div className="space-y-2">
                {peer.common_circles.map((circle) => (
                  <div
                    key={circle.id}
                    className="flex items-center gap-3 p-3 bg-appbg rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-royal to-darkblue rounded-lg flex items-center justify-center text-white font-bold">
                      {circle.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-navy">{circle.name}</p>
                      <p className="text-sm text-textsecondary">
                        {circle.domain}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn Profile */}
          {peer.profile?.linkedin && (
            <div>
              <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-royal" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn Profile
              </h4>
              <a
                href={peer.profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-royal hover:text-darkblue font-medium"
              >
                View on LinkedIn
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-borderline">
            {getActionButtons()}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
