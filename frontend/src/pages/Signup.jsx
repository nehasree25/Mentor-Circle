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

  // Form State
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    role: "student",

    // Student fields
    interests: "",
    experience_level: "beginner",
    skills: "",
    learning_goals: "",

    // Mentor fields
    mentorship_expertise: "",
    bio: "",
    years_of_experience: "",
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Clear field error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Frontend Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!form.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (form.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
    }

    if (form.password !== form.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
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

      // Student Payload
      if (form.role === "student") {
        payload = {
          ...payload,
          interests: form.interests,
          experience_level: form.experience_level,
          skills: form.skills,
          learning_goals: form.learning_goals,
        };
      }

      // Mentor Payload
      if (form.role === "mentor") {
        payload = {
          ...payload,
          is_mentor: true,
          mentorship_expertise:
            form.mentorship_expertise,
          skills: form.skills,
          bio: form.bio,
          years_of_experience:
            form.years_of_experience
              ? parseInt(form.years_of_experience)
              : 0,
        };
      }

      console.log("Signup Payload:", payload);

      // API Call
      const data = await authService.signup(payload);

      // Store Session
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
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-center mb-8">
          Create Account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* First Name */}
          <div>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.first_name}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.last_name}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
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
              className="w-full border rounded-xl p-3"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={form.password2}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
            {errors.password2 && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password2}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="student">
                Student
              </option>
              <option value="mentor">
                Mentor
              </option>
            </select>
          </div>

          {/* Student Fields */}
          {form.role === "student" && (
            <>
              <input
                type="text"
                name="interests"
                placeholder="Interests"
                value={form.interests}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />

              <select
                name="experience_level"
                value={form.experience_level}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              >
                <option value="beginner">
                  Beginner
                </option>
                <option value="intermediate">
                  Intermediate
                </option>
                <option value="advanced">
                  Advanced
                </option>
              </select>

              <input
                type="text"
                name="skills"
                placeholder="Skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />

              <textarea
                name="learning_goals"
                placeholder="Learning Goals"
                value={form.learning_goals}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />
            </>
          )}

          {/* Mentor Fields */}
          {form.role === "mentor" && (
            <>
              <input
                type="text"
                name="mentorship_expertise"
                placeholder="Mentorship Expertise"
                value={form.mentorship_expertise}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />

              <input
                type="text"
                name="skills"
                placeholder="Skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />

              <input
                type="number"
                name="years_of_experience"
                placeholder="Years of Experience"
                value={form.years_of_experience}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />

              <textarea
                name="bio"
                placeholder="Bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              />
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl p-3 font-bold"
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Signup;