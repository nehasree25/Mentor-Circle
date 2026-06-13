import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { mentorshipService } from "../../services/mentorshipService";
import toast from "react-hot-toast";

export default function CollaborateModal({ peerId, circleId, peerName, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_topic: "",
    collaboration_goal: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  console.log("CollaborateModal rendered with:", { peerId, circleId, peerName });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_topic.trim()) {
      toast.error("Project topic is required");
      return;
    }

    if (!formData.collaboration_goal.trim()) {
      toast.error("Collaboration goal is required");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting collaboration request with data:", { circleId, peerId, formData });
      const response = await mentorshipService.createCollaborationRequest(circleId, peerId, formData);
      toast.success("Collaboration request sent successfully!");
      if (onSuccess) onSuccess();
      onClose();
      // Navigate to conversations page
      setTimeout(() => {
        navigate("/conversations");
      }, 500);
    } catch (error) {
      console.error("Failed to send collaboration request:", error);
      console.error("Error response:", error?.response?.data);
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.non_field_errors?.[0] ||
        error?.response?.data?.detail ||
        JSON.stringify(error?.response?.data) ||
        "Failed to send request";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-navy">Collaborate</h3>
            <p className="text-sm text-textsecondary mt-1">
              Request collaboration with {peerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-textsecondary hover:text-navy transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Topic */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Project Topic <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="project_topic"
              value={formData.project_topic}
              onChange={handleChange}
              placeholder="e.g., Build a Machine Learning Model"
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
              maxLength={200}
              required
            />
            <p className="text-xs text-textsecondary mt-1">
              What project or topic do you want to work on together?
            </p>
          </div>

          {/* Collaboration Goal */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Collaboration Goal <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="collaboration_goal"
              value={formData.collaboration_goal}
              onChange={handleChange}
              placeholder="e.g., Learn and implement a neural network from scratch"
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
              maxLength={300}
              required
            />
            <p className="text-xs text-textsecondary mt-1">
              What do you hope to achieve together?
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Explain why you'd like to collaborate and what you can bring to the project..."
              rows="5"
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal resize-none"
              maxLength={1000}
              required
            />
            <p className="text-xs text-textsecondary mt-1">
              {formData.message.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-borderline text-navy px-6 py-3 rounded-xl font-semibold hover:bg-appbg transition-all"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
