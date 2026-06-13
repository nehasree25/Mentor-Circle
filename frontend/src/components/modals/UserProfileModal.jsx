import { useState, useEffect } from "react";
import { X, BookOpen, Target, Lightbulb, Award, User } from "lucide-react";
import { mentorshipService } from "../../services/mentorshipService";
import toast from "react-hot-toast";

export default function UserProfileModal({
  userId,
  circleId,
  userType = "mentor", // 'mentor' or 'peer'
  onClose,
  onRequestGuidance,
  onCollaborate,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await mentorshipService.getUserProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
          <p className="text-center text-textsecondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-navy">Profile</h3>
          <button
            onClick={onClose}
            className="text-textsecondary hover:text-navy transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-borderline">
            <div className="w-20 h-20 rounded-full bg-softblue flex items-center justify-center">
              <User size={32} className="text-royal" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-navy">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-textsecondary">@{profile.username}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    userType === "mentor"
                      ? "bg-royal text-white"
                      : "bg-softblue text-royal"
                  }`}
                >
                  {profile.profile?.role || userType}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.profile?.bio && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2">About</h3>
              <p className="text-textsecondary">{profile.profile.bio}</p>
            </div>
          )}

          {/* Experience Level */}
          {profile.profile?.experience_level && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
                <Award size={20} className="text-royal" />
                Experience Level
              </h3>
              <p className="text-textsecondary">{profile.profile.experience_level}</p>
            </div>
          )}

          {/* Domains */}
          {profile.profile?.domains && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
                <BookOpen size={20} className="text-royal" />
                Domains
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.domains.split(",").map((domain, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-appbg text-navy rounded-lg text-sm font-medium"
                  >
                    {domain.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {profile.profile?.skills && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
                <Target size={20} className="text-royal" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.skills.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-softblue text-royal rounded-lg text-sm font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.profile?.interests && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
                <Lightbulb size={20} className="text-royal" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.interests.split(",").map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-appbg text-navy rounded-lg text-sm font-medium"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Goals */}
          {profile.profile?.learning_goals && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2">Learning Goals</h3>
              <p className="text-textsecondary">{profile.profile.learning_goals}</p>
            </div>
          )}

          {/* LinkedIn Profile */}
          {profile.profile?.linkedin && (
            <div>
              <h3 className="text-lg font-bold text-navy mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-royal" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn Profile
              </h3>
              <a
                href={profile.profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-royal hover:text-darkblue font-medium"
              >
                View on LinkedIn
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-borderline">
            {userType === "mentor" && onRequestGuidance && (
              <button
                onClick={() => {
                  onRequestGuidance(userId);
                  onClose();
                }}
                className="flex-1 bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all"
              >
                Request Guidance
              </button>
            )}
            {userType === "peer" && onCollaborate && (
              <button
                onClick={() => {
                  onCollaborate(userId);
                  onClose();
                }}
                className="flex-1 bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all"
              >
                Collaborate
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 border border-borderline text-navy px-6 py-3 rounded-xl font-semibold hover:bg-appbg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
