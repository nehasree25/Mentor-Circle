import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  AtSign,
  Award,
  BookOpen,
  Save,
  LogOut,
  Code,
  Heart,
  Target,
  UserCircle,
} from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user: authUser, setSession, updateProfile, clearSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // User data
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  });
  
  // Profile data
  const [profileData, setProfileData] = useState({
    role: "student",
    bio: "",
    domain: "",
    interests: "",
    experience_level: "beginner",
    skills: "",
    years_of_experience: "",
    mentorship_expertise: "",
    learning_goals: "",
    is_mentor: false,
  });
  
  const [domainChoices, setDomainChoices] = useState([]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userRes, profileRes] = await Promise.all([
        authService.profile.get(),
        authService.userprofile.get()
      ]);
      setUserData(userRes);
      setProfileData({
        ...profileRes,
        domain: profileRes.domain || "",
        years_of_experience: profileRes.years_of_experience?.toString() || "",
      });
      
      const defaultDomainChoices = [
        { value: "math", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "chemistry", label: "Chemistry" },
        { value: "biology", label: "Biology" },
        { value: "cs", label: "Computer Science" },
        { value: "engineering", label: "Engineering" },
        { value: "other", label: "Other STEM" },
      ];
      
      if (profileRes.domain_choices) {
        setDomainChoices(profileRes.domain_choices);
      } else {
        setDomainChoices(defaultDomainChoices);
      }
    } catch (error) {
      console.error("Profile load error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await authService.profile.update(userData);
      
      const profilePayload = {
        ...profileData,
        years_of_experience: profileData.years_of_experience
          ? parseInt(profileData.years_of_experience)
          : null,
        is_mentor: profileData.role === "mentor",
      };
      
      const updatedProfile = await authService.userprofile.update(profilePayload);
      
      setSession({
        user: { ...authUser, ...updatedUser },
        access: localStorage.getItem("access_token"),
        refresh: localStorage.getItem("refresh_token"),
      });
      updateProfile(updatedProfile);
      
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setEditing(false);
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  const tagList = (str) =>
    str?.split(",").map((t) => t.trim()).filter(Boolean) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-textsecondary text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-navy">Your Profile</h1>
        <div className="flex gap-3">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-royal px-6 py-3 font-semibold text-royal hover:bg-softblue transition-all flex items-center gap-2"
              >
                <User size={18} />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-300 bg-red-50 px-6 py-3 font-semibold text-red-600 hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="rounded-lg border border-borderline bg-white px-6 py-3 font-semibold text-navy hover:bg-appbg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-royal px-6 py-3 font-semibold text-white hover:bg-darkblue transition-all flex items-center gap-2 disabled:opacity-70"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
        <div className="flex gap-8 items-start">
          {/* Info Section */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-navy mb-2">
                  {userData.first_name}
                </h2>
                
                {/* Role Badge */}
                <div className="mb-4">
                  {profileData.role === "mentor" ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                      <Award size={14} />
                      Mentor
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-softblue px-4 py-2 text-sm font-semibold text-royal">
                      <BookOpen size={14} />
                      Student
                    </span>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-6 text-sm text-textsecondary mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">•</span>
                    <span>{profileData.role === "mentor" ? "Mentor" : "Student"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">•</span>
                    <span className="capitalize">{profileData.experience_level}</span>
                  </div>
                  {profileData.domain && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">•</span>
                      <span>{domainChoices.find(d => d.value === profileData.domain)?.label || profileData.domain}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {editing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
                    placeholder="Tell us a little about yourself..."
                  />
                ) : (
                  <p className="text-navy">
                    {profileData.bio || "No bio yet."}
                  </p>
                )}
              </div>

              {/* Email on Right */}
              <div className="text-right">
                <p className="text-xs text-textsecondary mb-1">Email</p>
                <div className="flex items-center gap-2 text-navy">
                  <Mail size={16} className="text-royal" />
                  <p className="text-sm font-medium">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid for Skills & Interests */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills Card */}
        <div className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-lg">
              <Code size={20} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-navy">Skills</h3>
          </div>
          {editing ? (
            <input
              type="text"
              value={profileData.skills}
              onChange={(e) =>
                setProfileData({ ...profileData, skills: e.target.value })
              }
              className="w-full rounded-lg border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none mb-4"
              placeholder="React, Python, JavaScript..."
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            {tagList(profileData.skills).length > 0 ? (
              tagList(profileData.skills).map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-textsecondary">{editing ? "Add skills..." : "No skills listed yet."}</p>
            )}
          </div>
        </div>

        {/* Interests Card */}
        <div className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Heart size={20} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-navy">Interests</h3>
          </div>
          {editing ? (
            <input
              type="text"
              value={profileData.interests}
              onChange={(e) =>
                setProfileData({ ...profileData, interests: e.target.value })
              }
              className="w-full rounded-lg border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none mb-4"
              placeholder="Machine Learning, Web Development..."
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            {tagList(profileData.interests).length > 0 ? (
              tagList(profileData.interests).map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-textsecondary">{editing ? "Add interests..." : "No interests listed yet."}</p>
            )}
          </div>
        </div>
      </div>

      {/* Learning Goals Card */}
      <div className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Target size={20} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-navy">Learning Goals</h3>
        </div>
        {editing ? (
          <textarea
            value={profileData.learning_goals}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                learning_goals: e.target.value,
              })
            }
            rows={3}
            className="w-full rounded-lg border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
            placeholder="What do you want to learn?"
          />
        ) : (
          <p className="text-navy">
            {profileData.learning_goals || "No goals set yet."}
          </p>
        )}
      </div>

      {/* Account Information Card */}
      <div className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <UserCircle size={20} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-navy">Account Information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-textsecondary mb-2">Email</p>
              <p className="text-navy font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-textsecondary mb-2">Username</p>
              <p className="text-navy font-medium">@{userData.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role & Experience Card */}
      <div className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <UserCircle size={20} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-navy">Role & Experience</h3>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-textsecondary mb-3">Role</p>
              {editing ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setProfileData({
                        ...profileData,
                        role: "student",
                        is_mentor: false,
                      })
                    }
                    className={`rounded-lg border px-4 py-2 font-semibold transition-all ${
                      profileData.role === "student"
                        ? "border-royal bg-blue-100 text-blue-700"
                        : "border-borderline hover:bg-appbg text-navy"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProfileData({
                        ...profileData,
                        role: "mentor",
                        is_mentor: true,
                      })
                    }
                    className={`rounded-lg border px-4 py-2 font-semibold transition-all ${
                      profileData.role === "mentor"
                        ? "border-royal bg-green-100 text-green-700"
                        : "border-borderline hover:bg-appbg text-navy"
                    }`}
                  >
                    Mentor
                  </button>
                </div>
              ) : (
                <p className="text-navy font-medium capitalize">
                  {profileData.role}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-textsecondary mb-3">Experience Level</p>
              {editing ? (
                <select
                  value={profileData.experience_level}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      experience_level: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-borderline px-4 py-2 focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              ) : (
                <p className="text-navy font-medium capitalize">
                  {profileData.experience_level}
                </p>
              )}
            </div>
          </div>

          {/* Mentor-specific fields */}
          {profileData.role === "mentor" && (
            <>
              <div>
                <p className="text-sm text-textsecondary mb-3">Mentorship Expertise</p>
                {editing ? (
                  <textarea
                    value={profileData.mentorship_expertise}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        mentorship_expertise: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
                    placeholder="What can you teach others?"
                  />
                ) : (
                  <p className="text-navy">
                    {profileData.mentorship_expertise || "No expertise listed yet."}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-textsecondary mb-3">Years of Experience</p>
                {editing ? (
                  <input
                    type="number"
                    value={profileData.years_of_experience}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        years_of_experience: e.target.value,
                      })
                    }
                    min="0"
                    className="w-full rounded-lg border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                  />
                ) : (
                  <p className="text-navy font-medium">
                    {profileData.years_of_experience
                      ? `${profileData.years_of_experience} years`
                      : "Not specified"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
