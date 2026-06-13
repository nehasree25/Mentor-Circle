import axios from "axios";
import toast from "react-hot-toast";

// Backend Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ================================
// Request Interceptor
// ================================
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token for auth routes (signup, login, refresh)
    const isAuthRoute =
      config.url?.includes("auth/login") ||
      config.url?.includes("auth/signup") ||
      config.url?.includes("auth/refresh");

    if (!isAuthRoute) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// Response Interceptor
// ================================
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Log all errors for debugging
    console.log("API Error:", {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    // Normalize error message for consistent handling
    if (!error.normalized) {
      let errorMessage = "An unexpected error occurred";
      
      if (error.response?.data) {
        // Check for common error message keys
        const data = error.response.data;
        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (Object.keys(data).length > 0) {
          // If it's a dict of field errors, join them
          errorMessage = Object.entries(data)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(", ")}`;
            })
            .join("; ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Attach normalized error for easy access
      error.normalized = {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      };
    }

    // Skip refresh for auth routes
    const isAuthRoute =
      originalRequest?.url?.includes("auth/login") ||
      originalRequest?.url?.includes("auth/signup");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Refresh token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;

        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
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