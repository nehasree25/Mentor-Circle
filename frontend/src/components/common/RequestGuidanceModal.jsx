import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Loader2, Check } from "lucide-react";
import { mentorshipService } from "../../services/mentorshipService";
import axios from "../../api/axios";

/**
 * RequestGuidanceModal
 *
 * Props:
 *  - mentor: the mentor user object
 *  - preselectedCircleId: optional circle id to pre-select (used from CircleDetail)
 *  - onClose: callback to close the modal
 */
const RequestGuidanceModal = ({ mentor, preselectedCircleId, onClose }) => {
  const [circles, setCircles] = useState([]);
  const [loadingCircles, setLoadingCircles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(preselectedCircleId || "");
  const [subject, setSubject] = useState("");
  const [guidanceTopic, setGuidanceTopic] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const { data } = await axios.get("dashboard/");
        setCircles(data.joined_circles || []);
      } catch {
        toast.error("Failed to load your circles");
      } finally {
        setLoadingCircles(false);
      }
    };
    fetchCircles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCircle || !subject || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await mentorshipService.createGuidanceRequest(selectedCircle, mentor.id, {
        subject,
        guidance_topic: guidanceTopic,
        message,
      });
      toast.success("Guidance request sent successfully!");
      onClose();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
        e?.response?.data?.non_field_errors?.[0] ||
        "Failed to send request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const mentorName =
    mentor.first_name || mentor.last_name
      ? `${mentor.first_name || ""} ${mentor.last_name || ""}`.trim()
      : mentor.username;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-navy">
            Request Guidance from {mentorName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Circle Select */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Choose a Circle <span className="text-red-500">*</span>
            </label>
            {loadingCircles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-blue-600" />
              </div>
            ) : circles.length === 0 ? (
              <p className="text-sm text-gray-500">
                You need to join a circle first before requesting guidance.
              </p>
            ) : (
              <select
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
                disabled={!!preselectedCircleId}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-100"
              >
                <option value="">Select a circle...</option>
                {circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Calculus, Machine Learning"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
            />
          </div>

          {/* Guidance Topic */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Specific Topic
            </label>
            <input
              type="text"
              value={guidanceTopic}
              onChange={(e) => setGuidanceTopic(e.target.value)}
              placeholder="e.g., Chain Rule, Neural Network Basics"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain what you need help with..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCircle || !subject || !message}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestGuidanceModal;
