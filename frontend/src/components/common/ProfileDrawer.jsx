import { useEffect } from "react";
import { X, User, BookOpen, Lightbulb, Target, Globe } from "lucide-react";

/**
 * Slide-in profile drawer.
 * Shows: skills, interests, domain, learning_goals
 * Props:
 *   person  — user object { first_name, last_name, username, profile: {...} }
 *   onClose — fn to close
 */
const ProfileDrawer = ({ person, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!person) return null;

  const profile = person.profile || {};
  const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ") || person.username;

  const fields = [
    {
      icon: Globe,
      label: "Domain",
      value: profile.domain,
      color: "text-[#1a56db]",
      bg: "bg-[#EFF6FF]",
    },
    {
      icon: BookOpen,
      label: "Interests",
      value: profile.interests,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      icon: Lightbulb,
      label: "Skills",
      value: profile.skills || profile.mentorship_expertise,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: Target,
      label: "Learning Goals",
      value: profile.learning_goals,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name */}
          <div className="flex flex-col items-center text-center gap-3">
            <div>
              <p className="text-[17px] font-bold text-[#0F172A]">{fullName}</p>
              {(profile.current_role || profile.role) && (
                <p className="text-[13px] text-[#64748B] mt-0.5">
                  {profile.current_role || profile.role}
                </p>
              )}
              {profile.experience_level && (
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-[#EFF6FF] text-[#1a56db] text-[11px] font-semibold rounded-full">
                  {profile.experience_level}
                </span>
              )}
            </div>
          </div>

          {/* Info fields */}
          <div className="space-y-4">
            {fields.map((field, i) => {
              if (!field.value) return null;
              return (
                <div key={i} className="rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 ${field.bg} rounded-lg flex items-center justify-center`}>
                      <field.icon size={14} className={field.color} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                      {field.label}
                    </span>
                  </div>
                  {/* Render comma-separated values as tags, or plain text */}
                  {field.value.includes(",") ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {field.value.split(",").map((v, j) => (
                        <span
                          key={j}
                          className={`px-2.5 py-1 ${field.bg} ${field.color} text-[12px] font-medium rounded-full`}
                        >
                          {v.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13.5px] text-[#334155] leading-relaxed">{field.value}</p>
                  )}
                </div>
              );
            })}

            {/* Years of experience (mentors) */}
            {profile.years_of_experience && (
              <div className="rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                  <User size={14} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-0.5">
                    Experience
                  </p>
                  <p className="text-[13.5px] text-[#334155] font-medium">
                    {profile.years_of_experience} year{profile.years_of_experience !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}

            {/* LinkedIn Profile */}
            {profile.linkedin && (
              <div className="rounded-xl border border-[#E2E8F0] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                    LinkedIn
                  </span>
                </div>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13.5px] text-[#1a56db] hover:text-blue-700 font-medium"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
};

export default ProfileDrawer;
