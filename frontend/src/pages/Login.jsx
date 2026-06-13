import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const data = await authService.login(form);
      await setSession({ 
        user: data.user, 
        access: data.access, 
        refresh: data.refresh
      });
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      // Initialize as generic error
      let userErrorMessage = "Unable to login. Please try again.";

      if (error?.response) {
        const backendErrors = error.response.data;

        // Try all possible error formats
        if (typeof backendErrors === "string") {
          userErrorMessage = backendErrors;
        } else if (backendErrors?.error) {
          userErrorMessage = backendErrors.error;
        } else if (backendErrors?.detail) {
          userErrorMessage = backendErrors.detail;
        } else if (error.response.status === 401) {
          userErrorMessage = "Invalid username or password.";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
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
                Welcome Back
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-10 max-w-md">
                Continue your learning journey with access to your personalized dashboard, mentors, and learning circles.
              </p>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-softblue flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-royal">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Connect with Mentors</p>
                    <p className="text-gray-400 text-xs">Get guidance from industry experts</p>
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
                    <p className="font-semibold text-sm">Join Learning Circles</p>
                    <p className="text-gray-400 text-xs">Collaborate with like-minded peers</p>
                  </div>
                </div>
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
                    <p className="font-semibold text-sm">Track Your Progress</p>
                    <p className="text-gray-400 text-xs">Visualize your learning journey</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SECTION - Login Form */}
        <section className="bg-white p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6 md:hidden">
                <img src="/logo.png" alt="MentorCircle Logo" className="h-9 w-auto" />
                <span className="text-lg font-bold text-darkblue">MentorCircle</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy">Sign in to your account</h2>
              <p className="text-textsecondary mt-2 text-sm">
                Enter your details to continue.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all duration-200 ${
                    errors.username
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "focus:border-royal focus:ring-4 focus:ring-softblue"
                  }`}
                  disabled={loading}
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

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-navy">Password</label>
                  <button type="button" className="text-xs text-royal font-medium hover:text-darkblue">
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border border-borderline px-4 py-3 text-sm outline-none transition-all duration-200 ${
                    errors.password
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "focus:border-royal focus:ring-4 focus:ring-softblue"
                  }`}
                  disabled={loading}
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-royal hover:bg-darkblue text-white font-semibold py-3 px-5 text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-royal/20 mt-2"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              {/* Signup Link */}
              <p className="text-center text-textsecondary text-sm mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-royal hover:text-darkblue transition-colors"
                >
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
