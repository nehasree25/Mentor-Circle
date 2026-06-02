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
      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">
        {/* LEFT SECTION */}
        <section className="hidden md:flex flex-col justify-between bg-navy p-12 text-white">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome Back to<br />
              <span className="text-royal">STEM Learning</span>
            </h1>
            <p className="text-textsecondary text-lg leading-relaxed max-w-sm">
              Continue your learning journey, access your circles, and pick up where you left off.
            </p>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-5 mt-8">
            <p className="text-textsecondary text-sm">
              Access your personalized dashboard, mentors, and learning circles.
            </p>
          </div>
        </section>

        {/* RIGHT SECTION - Login Form */}
        <section className="bg-white p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-navy">Login</h2>
              <p className="text-textsecondary mt-2 text-sm">
                Welcome back! Please enter your details.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Username Field */}
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
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
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
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-royal hover:bg-darkblue text-white font-bold py-3.5 px-5 text-base transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              {/* Signup Link */}
              <p className="text-center text-textsecondary text-sm mt-4">
                New to MentorCircle?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-royal hover:text-darkblue transition-colors"
                >
                  Create Account
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
