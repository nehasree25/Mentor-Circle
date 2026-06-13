import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

// Domain options — matches backend UserProfile.INTEREST_CHOICES
const DOMAIN_OPTIONS = [
  { value: "math", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "cs", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "other", label: "Other STEM" },
];

const Signup = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    password2: "",
    role: "student",
    domain: "",
    interests: "",
    experienceLevel: "beginner",
    skills: "",
    learningGoals: "",
    mentorshipExpertise: "",
    bio: "",
    yearsOfExperience: "",
    linkedin: "",
  });

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!form.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (!form.username.trim())
      newErrors.username = "Username is required";

    if (!form.email.trim())
      newErrors.email = "Email is required";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (form.password.length < 8)
      newErrors.password =
        "Password must be at least 8 characters";

    if (form.password !== form.password2)
      newErrors.password2 = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Base Payload
      let payload = {
        username: form.username,
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        password: form.password,
        password2: form.password2,
        role: form.role,
      };

      // Student
      if (form.role === "student") {
        payload = {
          ...payload,
          domain: form.domain,
          interests: form.interests,
          experience_level: form.experienceLevel,
          skills: form.skills,
          learning_goals: form.learningGoals,
          linkedin: form.linkedin,
        };
      }

      // Mentor
      if (form.role === "mentor") {
        payload = {
          ...payload,
          is_mentor: true,
          domain: form.domain,
          interests: form.interests,
          mentorship_expertise: form.mentorshipExpertise,
          skills: form.skills,
          bio: form.bio,
          years_of_experience: form.yearsOfExperience
            ? parseInt(form.yearsOfExperience)
            : 0,
          linkedin: form.linkedin,
        };
      }

      const data = await authService.signup(payload);

      // Save session
      await setSession({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");

    } catch (error) {
      let userErrorMessage = "Unable to create account.";

      if (error?.response?.data) {
        const backendErrors = error.response.data;

        if (typeof backendErrors === "object") {
          const formattedErrors = {};

          Object.keys(backendErrors).forEach((key) => {
            formattedErrors[key] = Array.isArray(backendErrors[key])
              ? backendErrors[key].join(" ")
              : String(backendErrors[key]);
          });

          setErrors(formattedErrors);

          userErrorMessage = "Please fix the highlighted fields.";
        }
      }

      toast.error(userErrorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-appbg flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-[1.1fr_1fr] overflow-hidden rounded-2xl shadow-xl border border-borderline">
        {/* LEFT SECTION - Hero */}
        <section className="hidden md:flex flex-col bg-navy text-white">
          <div className="p-10 md:p-14 flex flex-col flex-grow justify-between">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <img src="/logo.png" alt="MentorCircle Logo" className="h-10 w-auto" />
                <span className="text-xl font-bold text-white">MentorCircle</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Join MentorCircle
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-10 max-w-md">
                Join our community of learners and mentors. Collaborate, learn, and grow together in STEM.
              </p>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-softblue flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-royal">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Learn New Skills</p>
                    <p className="text-gray-400 text-xs">Grow your knowledge with expert guidance</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-softblue flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-royal">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Connect & Collaborate</p>
                    <p className="text-gray-400 text-xs">Work with peers in learning circles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SECTION - Signup Form */}
        <section className="bg-white p-8 md:p-12 overflow-y-auto max-h-screen">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6 md:hidden">
                <img src="/logo.png" alt="MentorCircle Logo" className="h-9 w-auto" />
                <span className="text-lg font-bold text-darkblue">MentorCircle</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy">Create your account</h2>
              <p className="text-textsecondary mt-2 text-sm">
                Fill in your details to get started.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all ${
                      errors.firstName
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all ${
                      errors.lastName
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all ${
                    errors.username
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "focus:border-royal focus:ring-4 focus:ring-softblue"
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all ${
                    errors.email
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "focus:border-royal focus:ring-4 focus:ring-softblue"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all ${
                      errors.password
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="password2"
                    placeholder="••••••••"
                    value={form.password2}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all ${
                      errors.password2
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                  />
                  {errors.password2 && (
                    <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errors.password2}
                    </p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-navy">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        role: "student",
                      })
                    }
                    className={`rounded-lg border-2 py-3 px-4 text-sm font-semibold transition-all ${
                      form.role === "student"
                        ? "border-royal bg-softblue text-royal"
                        : "border-borderline text-navy hover:bg-appbg"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        role: "mentor",
                      })
                    }
                    className={`rounded-lg border-2 py-3 px-4 text-sm font-semibold transition-all ${
                      form.role === "mentor"
                        ? "border-royal bg-softblue text-royal"
                        : "border-borderline text-navy hover:bg-appbg"
                    }`}
                  >
                    Mentor
                  </button>
                </div>
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Domain</label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                >
                  <option value="">Select Domain</option>
                  {DOMAIN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={form.linkedin}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                />
              </div>

              {/* STUDENT */}
              {form.role === "student" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Interests</label>
                    <input
                      type="text"
                      name="interests"
                      placeholder="e.g. Machine Learning, Data Structures"
                      value={form.interests}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Experience Level</label>
                    <select
                      name="experienceLevel"
                      value={form.experienceLevel}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Skills</label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="e.g. Python, React, C++"
                      value={form.skills}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Learning Goals</label>
                    <textarea
                      name="learningGoals"
                      placeholder="What do you want to learn?"
                      value={form.learningGoals}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>
                </div>
              )}

              {/* MENTOR */}
              {form.role === "mentor" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Interests</label>
                    <input
                      type="text"
                      name="interests"
                      placeholder="e.g. AI, Deep Learning"
                      value={form.interests}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Mentorship Expertise</label>
                    <input
                      type="text"
                      name="mentorshipExpertise"
                      placeholder="What can you mentor in?"
                      value={form.mentorshipExpertise}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Skills</label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="e.g. Python, TensorFlow"
                      value={form.skills}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      placeholder="3"
                      value={form.yearsOfExperience}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Short Bio</label>
                    <textarea
                      name="bio"
                      placeholder="Tell us about yourself"
                      value={form.bio}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      className="w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all focus:border-royal focus:ring-4 focus:ring-softblue"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-royal hover:bg-darkblue text-white font-semibold py-3 px-5 text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-royal/20 mt-2"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              {/* Login */}
              <p className="text-center text-sm text-textsecondary">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-royal font-semibold hover:text-darkblue transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Signup;
