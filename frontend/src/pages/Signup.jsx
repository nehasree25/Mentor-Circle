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
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    role: "student",

    // Common
    domain: "",
    interests: "",

    // Student
    experience_level: "beginner",
    skills: "",
    learning_goals: "",

    // Mentor
    mentorship_expertise: "",
    bio: "",
    years_of_experience: "",
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

    if (!form.first_name.trim())
      newErrors.first_name = "First name is required";

    if (!form.last_name.trim())
      newErrors.last_name = "Last name is required";

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
        first_name: form.first_name,
        last_name: form.last_name,
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
          experience_level: form.experience_level,
          skills: form.skills,
          learning_goals: form.learning_goals,
        };
      }

      // Mentor
      if (form.role === "mentor") {
        payload = {
          ...payload,
          is_mentor: true,
          domain: form.domain,
          interests: form.interests,
          mentorship_expertise: form.mentorship_expertise,
          skills: form.skills,
          bio: form.bio,
          years_of_experience: form.years_of_experience
            ? parseInt(form.years_of_experience)
            : 0,
        };
      }

      const data = await authService.signup(payload);

      // Save session
      await setSession({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });

      toast.success(
        "Account created successfully!"
      );

      navigate("/dashboard");

    } catch (error) {
      console.error("Signup error:", error);

      if (error.response) {
        console.log(
          "Backend Error:",
          error.response.data
        );
      }

      let userErrorMessage =
        "Unable to create account.";

      if (error?.response?.data) {
        const backendErrors = error.response.data;

        if (typeof backendErrors === "object") {
          const formattedErrors = {};

          Object.keys(backendErrors).forEach((key) => {
            formattedErrors[key] = Array.isArray(
              backendErrors[key]
            )
              ? backendErrors[key].join(" ")
              : String(backendErrors[key]);
          });

          setErrors(formattedErrors);

          userErrorMessage =
            "Please fix the highlighted fields.";
        }
      }

      toast.error(userErrorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-appbg py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">

          {/* LEFT SIDE */}
          <section className="hidden md:flex flex-col justify-between bg-navy p-12 text-white">

            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Join the Future
                <br />
                of{" "}
                <span className="text-royal">
                  STEM Learning
                </span>
              </h1>

              <p className="text-textsecondary text-lg leading-relaxed max-w-sm">
                Collaborate with peers, discover
                mentors, and grow together in
                AI-powered learning circles.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5">
              <p className="text-textsecondary text-sm">
                Learn Web Development,
                AI/ML, Cybersecurity, DSA,
                and more.
              </p>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="bg-white p-8 md:p-12">
            <div className="max-w-md mx-auto">

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="MentorCircle Logo" className="h-10 w-auto" />
                  <span className="text-xl font-bold text-darkblue">MentorCircle</span>
                </div>
                <h2 className="text-3xl font-bold text-navy">
                  Create Account
                </h2>

                <p className="text-textsecondary mt-2 text-sm">
                  Start your mentorship journey today.
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="First Name"
                      value={form.first_name}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full rounded-xl border px-5 py-3.5 outline-none transition-all ${
                        errors.first_name
                          ? "border-red-500 bg-red-50"
                          : "border-borderline focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                    />

                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1">
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
                      disabled={loading}
                      className={`w-full rounded-xl border px-5 py-3.5 outline-none transition-all ${
                        errors.last_name
                          ? "border-red-500 bg-red-50"
                          : "border-borderline focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                    />

                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1">
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
                    disabled={loading}
                    className={`w-full rounded-xl border px-5 py-3.5 outline-none transition-all ${
                      errors.username
                        ? "border-red-500 bg-red-50"
                        : "border-borderline focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                  />

                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
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
                    disabled={loading}
                    className={`w-full rounded-xl border px-5 py-3.5 outline-none transition-all ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-borderline focus:border-royal focus:ring-4 focus:ring-softblue"
                    }`}
                  />

                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full rounded-xl border px-5 py-3.5 outline-none transition-all ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-borderline focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                    />

                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
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
                      disabled={loading}
                      className={`w-full rounded-xl border px-5 py-3.5 outline-none transition-all ${
                        errors.password2
                          ? "border-red-500 bg-red-50"
                          : "border-borderline focus:border-royal focus:ring-4 focus:ring-softblue"
                      }`}
                    />

                    {errors.password2 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password2}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-3">

                  <label className="text-sm font-semibold text-navy">
                    Who are you?
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          role: "student",
                        })
                      }
                      className={`rounded-xl border-2 py-4 font-semibold transition-all ${
                        form.role === "student"
                          ? "border-royal bg-softblue text-royal"
                          : "border-borderline"
                      }`}
                    >
                      👨‍🎓 Student
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          role: "mentor",
                        })
                      }
                      className={`rounded-xl border-2 py-4 font-semibold transition-all ${
                        form.role === "mentor"
                          ? "border-royal bg-softblue text-royal"
                          : "border-borderline"
                      }`}
                    >
                      🎓 Mentor
                    </button>
                  </div>
                </div>

                {/* Domain — shared for both student and mentor */}
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1">Domain</label>
                  <select
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-borderline px-5 py-3.5 outline-none focus:border-royal focus:ring-4 focus:ring-softblue"
                  >
                    <option value="">Select Domain</option>
                    {DOMAIN_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* STUDENT */}
                {form.role === "student" && (
                  <>

                    <input
                      type="text"
                      name="interests"
                      placeholder="Interests (e.g. Machine Learning, DSA)"
                      value={form.interests}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />

                    <select
                      name="experience_level"
                      value={form.experience_level}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>

                    <input
                      type="text"
                      name="skills"
                      placeholder="Skills (e.g. Python, React)"
                      value={form.skills}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />

                    <textarea
                      name="learning_goals"
                      placeholder="Learning Goals"
                      value={form.learning_goals}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />
                  </>
                )}

                {/* MENTOR */}
                {form.role === "mentor" && (
                  <>
                    <input
                      type="text"
                      name="interests"
                      placeholder="Interests (e.g. AI, Deep Learning)"
                      value={form.interests}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />

                    <input
                      type="text"
                      name="mentorship_expertise"
                      placeholder="Mentorship Expertise"
                      value={form.mentorship_expertise}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />

                    <input
                      type="text"
                      name="skills"
                      placeholder="Skills (e.g. Python, TensorFlow)"
                      value={form.skills}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />

                    <input
                      type="number"
                      name="years_of_experience"
                      placeholder="Years of Experience"
                      value={form.years_of_experience}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />

                    <textarea
                      name="bio"
                      placeholder="Short Bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-xl border border-borderline px-5 py-3.5"
                    />
                  </>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-royal hover:bg-darkblue text-white font-bold py-3.5 transition-all"
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </button>

                {/* Login */}
                <p className="text-center text-sm text-textsecondary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-royal font-bold"
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