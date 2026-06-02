import axios from "axios";
import toast from "react-hot-toast";

// Backend Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ================================
// Request Interceptor
// Adds JWT token to every request
// ================================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================
// Response Interceptor
// Handles automatic token refresh
// ======================================
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for login/signup requests
    const isAuthRoute =
      originalRequest?.url?.includes("/api/auth/login/") ||
      originalRequest?.url?.includes("/api/auth/signup/");

    // Token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        // No refresh token → logout
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Refresh access token
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;

        // Save new token
        localStorage.setItem("access_token", access);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.clear();

        toast.error("Session expired. Please login again.");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;