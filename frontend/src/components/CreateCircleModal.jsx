import { useState } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { circleService } from "../services/circleService";

const CreateCircleModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    domain: "computer_science",
    skill_level: "beginner",
    location: "Online",
    preferred_language: "english",
    max_members: "30",
    is_private: false,
  });

  const domainOptions = [
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "computer_science", label: "Computer Science" },
    { value: "engineering", label: "Engineering" },
    { value: "data_science", label: "Data Science" },
    { value: "robotics", label: "Robotics" },
    { value: "astronomy", label: "Astronomy" },
    { value: "other", label: "Other STEM" },
  ];

  const skillLevelOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "chinese", label: "Chinese" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        max_members: parseInt(formData.max_members),
      };
      await circleService.createCircle(data);
      toast.success("Circle created successfully!");
      onSuccess();
    } catch (error) {
      const errors = error?.response?.data;
      if (typeof errors === "string") {
        toast.error(errors);
      } else {
        toast.error(Object.values(errors).flat().join(", "));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderline p-6">
          <h2 className="text-2xl font-bold text-navy">Create Learning Circle</h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-appbg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textsecondary">Circle Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
              placeholder="e.g. Python for Beginners"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-textsecondary">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
              placeholder="Tell others what this circle is about..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-textsecondary">STEM Domain</label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white"
              >
                {domainOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-textsecondary">Skill Level</label>
              <select
                name="skill_level"
                value={formData.skill_level}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white"
              >
                {skillLevelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-textsecondary">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                placeholder="e.g. Online or New York"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-textsecondary">Language</label>
              <select
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white"
              >
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-textsecondary">Max Members</label>
              <input
                type="number"
                name="max_members"
                value={formData.max_members}
                onChange={handleChange}
                min="2"
                max="50"
                className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={handleChange}
                  className="w-5 h-5 text-royal rounded focus:ring-softblue"
                />
                <span className="text-sm font-semibold text-navy">Private Circle</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-borderline">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-borderline px-6 py-3 font-semibold text-navy hover:bg-appbg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-royal px-6 py-3 font-semibold text-white hover:bg-darkblue transition-all disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Circle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCircleModal;
