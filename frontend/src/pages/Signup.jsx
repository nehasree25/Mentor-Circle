import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Combined form state for account and profile
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    role: "student",
    interests: "",
    experience_level: "beginner",
    skills: "",
    learning_goals: "",
    mentorship_expertise: "",
    bio: "",
    years_of_experience: "",
    is_mentor: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.password2)
      newErrors.password2 = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Prepare payload with is_mentor set based on role
      const payload = {
        ...form,
        is_mentor: form.role === "mentor",
        years_of_experience: form.years_of_experience
          ? parseInt(form.years_of_experience)
          : null,
      };

      const data = await authService.signup(payload);
      // Store tokens and user
      await setSession({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });

      toast.success("Account created successfully! Welcome!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      
      // Initialize as generic error
      let userErrorMessage = "Unable to create account. Please try again.";

      if (error?.response) {
        const backendErrors = error.response.data;

        // Try all possible error formats
        if (typeof backendErrors === "string") {
          userErrorMessage = backendErrors;
        } else if (backendErrors?.error) {
          userErrorMessage = backendErrors.error;
        } else if (backendErrors?.detail) {
          userErrorMessage = backendErrors.detail;
        } else if (typeof backendErrors === "object" && backendErrors !== null) {
          // Field-specific errors
          const formattedErrors = {};
          Object.keys(backendErrors).forEach(key => {
            formattedErrors[key] = Array.isArray(backendErrors[key]) 
              ? backendErrors[key].join(" ") 
              : String(backendErrors[key]);
          });
          setErrors(formattedErrors);
          
          if (Object.keys(formattedErrors).length > 0) {
            userErrorMessage = "Please fix the errors below.";
          }
        }
      } else if (error?.message) {
        userErrorMessage = error.message;
      }

      // Show the error to user
      toast.error(userErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-appbg py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">
          {/* LEFT SECTION */}
          <section className="hidden md:flex flex-col justify-between bg-navy p-12 text-white">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Join the Future<br />
                of <span className="text-royal">STEM Learning</span>
              </h1>
              <p className="text-textsecondary text-lg leading-relaxed max-w-sm">
                Collaborate with peers, discover mentors, and grow together in AI-powered learning circles.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 mt-8">
              <p className="text-textsecondary text-sm">
                Learn Web Development, AI/ML, Cybersecurity, DSA, and more.
              </p>
            </div>
          </section>

          {/* RIGHT SECTION - Signup Form */}
          <section className="bg-white p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-navy">Create Account</h2>
                <p className="text-textsecondary mt-2 text-sm">
                  Start your mentorship journey today.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="First Name"
                      value={form.first_name}
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium ${
                        errors.first_name
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                      disabled={loading}
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Last Name"
                      value={form.last_name}
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium ${
                        errors.last_name
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                      disabled={loading}
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium ${
                      errors.username
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                    disabled={loading}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium ${
                      errors.email
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium ${
                        errors.password
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password2"
                      placeholder="Confirm Password"
                      value={form.password2}
                      onChange={handleChange}
                      className={`w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium ${
                        errors.password2
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                      disabled={loading}
                    />
                    {errors.password2 && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.password2}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-navy">Who are you?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, role: "student" });
                      }}
                      className={`rounded-xl border-2 py-4 px-5 font-semibold transition-all duration-200 flex flex-col items-center ${
                        form.role === "student"
                          ? "border-royal bg-softblue text-royal"
                          : "border-borderline bg-white text-navy hover:border-royal hover:bg-softblue"
                      }`}
                    >
                      <span className="text-2xl mb-2">👨‍🎓</span>
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, role: "mentor" });
                      }}
                      className={`rounded-xl border-2 py-4 px-5 font-semibold transition-all duration-200 flex flex-col items-center ${
                        form.role === "mentor"
                          ? "border-royal bg-softblue text-royal"
                          : "border-borderline bg-white text-navy hover:border-royal hover:bg-softblue"
                      }`}
                    >
                      <span className="text-2xl mb-2">🎓</span>
                      <span>Mentor</span>
                    </button>
                  </div>
                </div>

                {/* Student Fields */}
                {form.role === "student" && (
                  <>
                    <div>
                      <input
                        type="text"
                        name="interests"
                        placeholder="Interests (e.g., Web Development, AI/ML)"
                        value={form.interests}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium focus:border-royal focus:ring-4 focus:ring-softblue"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <select
                        name="experience_level"
                        value={form.experience_level}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 cursor-pointer focus:border-royal focus:ring-4 focus:ring-softblue bg-white font-medium"
                        disabled={loading}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        name="skills"
                        placeholder="Skills (comma-separated, e.g., React, Python)"
                        value={form.skills}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium focus:border-royal focus:ring-4 focus:ring-softblue"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <textarea
                        name="learning_goals"
                        placeholder="Learning Goals"
                        value={form.learning_goals}
                        onChange={handleChange}
                        rows="3"
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 resize-none focus:border-royal focus:ring-4 focus:ring-softblue bg-white font-sans font-medium"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                {/* Mentor Fields */}
                {form.role === "mentor" && (
                  <>
                    <div>
                      <input
                        type="text"
                        name="mentorship_expertise"
                        placeholder="Mentorship Expertise"
                        value={form.mentorship_expertise}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium focus:border-royal focus:ring-4 focus:ring-softblue"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="skills"
                        placeholder="Skills (comma-separated, e.g., React, Python)"
                        value={form.skills}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium focus:border-royal focus:ring-4 focus:ring-softblue"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        name="years_of_experience"
                        placeholder="Years of Experience"
                        min="0"
                        value={form.years_of_experience}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 font-medium focus:border-royal focus:ring-4 focus:ring-softblue"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <textarea
                        name="bio"
                        placeholder="Short Bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows="3"
                        className="w-full rounded-xl border border-borderline px-5 py-3.5 text-base outline-none transition-all duration-200 resize-none font-sans font-medium focus:border-royal focus:ring-4 focus:ring-softblue bg-white"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-royal hover:bg-darkblue text-white font-bold py-3.5 px-5 text-base transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                {/* Login Link */}
                <p className="text-center text-textsecondary text-sm mt-4">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-royal hover:text-darkblue transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Signup;
