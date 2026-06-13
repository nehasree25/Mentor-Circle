import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { mentorshipService } from "../../services/mentorshipService";
import toast from "react-hot-toast";

export default function RequestGuidanceModal({ mentorId, circleId, mentorName, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    guidance_topic: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  console.log("RequestGuidanceModal rendered with:", { mentorId, circleId, mentorName });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!formData.guidance_topic.trim()) {
      toast.error("Guidance topic is required");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting guidance request with data:", { circleId, mentorId, formData });
      const response = await mentorshipService.createGuidanceRequest(circleId, mentorId, formData);
      toast.success("Guidance request sent successfully!");
      if (onSuccess) onSuccess();
      onClose();
      // Navigate to conversations page
      setTimeout(() => {
        navigate("/conversations");
      }, 500);
    } catch (error) {
      console.error("Failed to send guidance request:", error);
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
            <h3 className="text-2xl font-bold text-navy">Request Guidance</h3>
            <p className="text-sm text-textsecondary mt-1">
              Request mentorship from {mentorName}
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
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Subject <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Neural Networks"
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
              maxLength={200}
              required
            />
            <p className="text-xs text-textsecondary mt-1">
              What subject area do you need help with?
            </p>
          </div>

          {/* Guidance Topic */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Guidance Topic <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="guidance_topic"
              value={formData.guidance_topic}
              onChange={handleChange}
              placeholder="e.g., Understanding Backpropagation"
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
              maxLength={300}
              required
            />
            <p className="text-xs text-textsecondary mt-1">
              What specific topic do you want guidance on?
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
              placeholder="Explain what help you need and why you're seeking guidance..."
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
