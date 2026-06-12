import axiosInstance from "../api/axios";

export const circleService = {
  getCircles: async (params = {}) => {
    const response = await axiosInstance.get("circles/", { params });
    return response.data;
  },

  getMyCircles: async (params = {}) => {
    const response = await axiosInstance.get("circles/my-circles/", { params });
    return response.data;
  },

  searchCircles: async (params = {}) => {
    const response = await axiosInstance.get("circles/search/", { params });
    return response.data;
  },

  createCircle: async (data) => {
    const response = await axiosInstance.post("circles/create/", data);
    return response.data;
  },

  getCircleDetail: async (circleId) => {
    const response = await axiosInstance.get(`circles/${circleId}/`);
    return response.data;
  },

  joinCircle: async (circleId, data = {}) => {
    const response = await axiosInstance.post(`circles/join/${circleId}/`, data);
    return response.data;
  },

  leaveCircle: async (circleId) => {
    const response = await axiosInstance.post(`circles/leave/${circleId}/`);
    return response.data;
  },

  requestJoinCircle: async (circleId, data = {}) => {
    const response = await axiosInstance.post(`circles/request/${circleId}/`, data);
    return response.data;
  },

  approveJoinRequest: async (requestId) => {
    const response = await axiosInstance.post(`circles/request/${requestId}/approve/`);
    return response.data;
  },

  rejectJoinRequest: async (requestId) => {
    const response = await axiosInstance.post(`circles/request/${requestId}/reject/`);
    return response.data;
  },

  getPendingRequests: async (circleId) => {
    const response = await axiosInstance.get(`circles/${circleId}/pending-requests/`);
    return response.data;
  },

  addMentor: async (circleId, mentorId) => {
    const response = await axiosInstance.post(`circles/${circleId}/mentors/add/${mentorId}/`);
    return response.data;
  },

  removeMentor: async (circleId, mentorId) => {
    const response = await axiosInstance.post(`circles/${circleId}/mentors/remove/${mentorId}/`);
    return response.data;
  },

  deleteCircle: async (circleId) => {
    const response = await axiosInstance.post(`circles/${circleId}/delete/`);
    return response.data;
  },

  getDiscussions: async (circleId, category = '') => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get(`circles/${circleId}/discussions/`, { params });
    return response.data;
  },

  createDiscussion: async (circleId, content, category = 'general') => {
    const response = await axiosInstance.post(`circles/${circleId}/discussions/create/`, {
      content,
      category
    });
    return response.data;
  },

  // Resources API
  getResources: async (circleId, params = {}) => {
    const response = await axiosInstance.get(`circles/${circleId}/resources/`, { params });
    return response.data;
  },

  createResource: async (circleId, formData) => {
    const response = await axiosInstance.post(
      `circles/${circleId}/resources/create/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  updateResource: async (resourceId, data) => {
    const response = await axiosInstance.patch(`circles/resources/${resourceId}/update/`, data);
    return response.data;
  },

  deleteResource: async (resourceId) => {
    const response = await axiosInstance.delete(`circles/resources/${resourceId}/delete/`);
    return response.data;
  },

  getResource: async (resourceId) => {
    const response = await axiosInstance.get(`circles/resources/${resourceId}/`);
    return response.data;
  },
};
