import axiosInstance from "../api/axios";

export const authService = {
  // =========================
  // Signup
  // =========================
  signup: async (data) => {
    const response = await axiosInstance.post(
      "api/auth/signup/",
      data
    );

    return response.data;
  },

  // =========================
  // Login
  // =========================
  login: async (data) => {
    const response = await axiosInstance.post(
      "api/auth/login/",
      data
    );

    return response.data;
  },

  // =========================
  // Profile
  // =========================
  profile: {
    get: async () => {
      const response = await axiosInstance.get(
        "api/auth/profile/"
      );

      return response.data;
    },

    update: async (data) => {
      const response = await axiosInstance.put(
        "api/auth/profile/",
        data
      );

      return response.data;
    },
  },

  // =========================
  // User Profile
  // =========================
  userprofile: {
    get: async () => {
      const response = await axiosInstance.get(
        "api/auth/userprofile/"
      );

      return response.data;
    },

    update: async (data) => {
      const response = await axiosInstance.patch(
        "api/auth/userprofile/",
        data
      );

      return response.data;
    },
  },

  // =========================
  // Stats
  // =========================
  stats: {
    get: async () => {
      const response = await axiosInstance.get(
        "api/profile/stats/"
      );

      return response.data;
    },
  },

  // =========================
  // Logout
  // =========================
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_profile");
  },
};