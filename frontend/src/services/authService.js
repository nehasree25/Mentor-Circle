import axiosInstance from "../api/axios";

export const authService = {
  signup: async (data) => {
    const response = await axiosInstance.post(
      "auth/signup/",
      data
    );
    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post(
      "auth/login/",
      data
    );
    return response.data;
  },

  profile: {
    get: async () => {
      const response = await axiosInstance.get(
        "auth/profile/"
      );
      return response.data;
    },
    update: async (data) => {
      const response = await axiosInstance.put(
        "auth/profile/",
        data
      );
      return response.data;
    },
  },

  userprofile: {
    get: async () => {
      const response = await axiosInstance.get("auth/userprofile/");
      return response.data;
    },
    update: async (data) => {
      const response = await axiosInstance.patch("auth/userprofile/", data);
      return response.data;
    },
  },

  stats: {
    get: async () => {
      const response = await axiosInstance.get("profile/stats/");
      return response.data;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
  },
};

