import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  AtSign,
  Award,
  BookOpen,
  Save,
  Camera,
  Loader2,
} from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import { API_BASE_URL } from "../api/axios";

const Profile = () => {
  const { user: authUser, setSession, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
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
    profile_picture: null,
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
      
      // Set domain choices with defaults if not available from backend
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
      
      const getPreviewUrl = (pic) => {
        if (!pic) return null;
        if (pic.startsWith("http://") || pic.startsWith("https://")) {
          return pic;
        }
        const baseMediaUrl = API_BASE_URL.replace(/\/api$/, "");
        if (pic.startsWith("/")) {
          return `${baseMediaUrl}${pic}`;
        }
        return `${baseMediaUrl}/media/${pic}`;
      };
      if (profileRes.profile_picture) {
        setImagePreview(getPreviewUrl(profileRes.profile_picture));
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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true);
    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const updatedProfile = await authService.userprofile.update(formData);
      setProfileData({
        ...profileData,
        profile_picture: updatedProfile.profile_picture,
      });
      updateProfile(updatedProfile);
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user data
      const updatedUser = await authService.profile.update(userData);
      
      // Update profile data
      const profilePayload = {
        ...profileData,
        years_of_experience: profileData.years_of_experience
          ? parseInt(profileData.years_of_experience)
          : null,
        is_mentor: profileData.role === "mentor",
      };
      // Remove profile_picture from payload since we handle it separately
      delete profilePayload.profile_picture;
      
      const updatedProfile = await authService.userprofile.update(profilePayload);
      
      // Update auth context
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-navy">Your Profile</h1>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-xl bg-royal px-6 py-3 font-semibold text-white hover:bg-darkblue transition-all flex items-center gap-2"
          >
            <User size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="rounded-xl border border-borderline bg-white px-6 py-3 font-semibold text-navy hover:bg-appbg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-royal px-6 py-3 font-semibold text-white hover:bg-darkblue transition-all flex items-center gap-2 disabled:opacity-70"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <div className="rounded-3xl border border-borderline bg-white p-6 shadow-soft">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar 
                  user={{
                    ...userData,
                    profile: profileData
                  }} 
                  size="w-28 h-28" 
                />
                {editing && (
                  <label className="absolute bottom-1 right-1 bg-royal text-white p-2 rounded-xl hover:bg-darkblue transition-all cursor-pointer">
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <h3 className="text-xl font-bold text-navy text-center">
                {userData.first_name} {userData.last_name}
              </h3>
              <p className="text-textsecondary text-center">@{userData.username}</p>
              <p className="text-textsecondary text-sm text-center mt-1">
                {userData.email}
              </p>

              {/* Role Badge */}
              <div className="mt-4">
                {profileData.role === "mentor" ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    <Award size={14} />
                    Mentor
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    <BookOpen size={14} />
                    Student
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - About */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl border border-borderline bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-navy mb-6">About</h2>
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-textsecondary">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={userData.first_name}
                      onChange={(e) =>
                        setUserData({ ...userData, first_name: e.target.value })
                      }
                      className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                    />
                  ) : (
                    <div className="text-navy">
                      {userData.first_name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-textsecondary">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={userData.last_name}
                      onChange={(e) =>
                        setUserData({ ...userData, last_name: e.target.value })
                      }
                      className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                    />
                  ) : (
                    <div className="text-navy">
                      {userData.last_name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-textsecondary">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                    />
                  ) : (
                    <div className="text-navy">
                      {userData.email}
                    </div>
                  )}
                </div>
              </div>
              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">Bio</label>
                {editing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
                    placeholder="Tell us a little about yourself..."
                  />
                ) : (
                  <p className="text-navy leading-relaxed">
                    {profileData.bio || "No bio yet."}
                  </p>
                )}
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">Domain</label>
                {editing ? (
                  <select
                    value={profileData.domain || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, domain: e.target.value })
                    }
                    className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white max-w-md"
                  >
                    <option value="">Select a domain...</option>
                    {domainChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.domain ? (
                      <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
                        {domainChoices.find(d => d.value === profileData.domain)?.label || profileData.domain}
                      </span>
                    ) : (
                      <p className="text-textsecondary">No domain selected yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">
                  Interests (comma separated)
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData.interests}
                    onChange={(e) =>
                      setProfileData({ ...profileData, interests: e.target.value })
                    }
                    className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                    placeholder="Machine Learning, Web Development, Data Science..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tagList(profileData.interests).length > 0 ? (
                      tagList(profileData.interests).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-softblue px-3 py-1.5 text-sm font-medium text-royal"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-textsecondary">No interests listed yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">
                  Skills (comma separated)
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profileData.skills}
                    onChange={(e) =>
                      setProfileData({ ...profileData, skills: e.target.value })
                    }
                    className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                    placeholder="React, Python, JavaScript, TensorFlow..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tagList(profileData.skills).length > 0 ? (
                      tagList(profileData.skills).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-textsecondary">No skills listed yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Learning Goals */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">
                  Learning Goals
                </label>
                {editing ? (
                  <textarea
                    value={profileData.learning_goals}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        learning_goals: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
                    placeholder="What do you want to learn?"
                  />
                ) : (
                  <p className="text-navy">
                    {profileData.learning_goals || "No goals set yet."}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">Role</label>
                {editing ? (
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          role: "student",
                          is_mentor: false,
                        })
                      }
                      className={`rounded-xl border px-4 py-2 font-semibold transition-all ${
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
                      className={`rounded-xl border px-4 py-2 font-semibold transition-all ${
                        profileData.role === "mentor"
                          ? "border-royal bg-green-100 text-green-700"
                          : "border-borderline hover:bg-appbg text-navy"
                      }`}
                    >
                      Mentor
                    </button>
                  </div>
                ) : (
                  <div className="text-navy font-medium">
                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-textsecondary">
                  Experience Level
                </label>
                {editing ? (
                  <select
                    value={profileData.experience_level}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        experience_level: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white max-w-xs"
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

              {/* Conditional Mentor Fields */}
              {profileData.role === "mentor" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-textsecondary">
                      Mentorship Expertise
                    </label>
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
                        className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none resize-none"
                        placeholder="What can you teach others?"
                      />
                    ) : (
                      <p className="text-navy">
                        {profileData.mentorship_expertise || "No expertise listed yet."}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-textsecondary">
                      Years of Experience
                    </label>
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
                        className="w-full rounded-xl border border-borderline px-4 py-3 focus:border-royal focus:ring-2 focus:ring-softblue outline-none max-w-xs"
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
      </div>
    </div>
  );
};

export default Profile;
