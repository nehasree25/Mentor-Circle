import axiosInstance from "../api/axios";

export const mentorshipService = {
  // ========================================================================
  // Guidance Requests (Student → Mentor)
  // ========================================================================

  createGuidanceRequest: async (circleId, mentorId, data) => {
    const response = await axiosInstance.post(
      `mentorship/guidance/request/${circleId}/${mentorId}/`,
      data
    );
    return response.data;
  },

  getMyGuidanceRequests: async (params = {}) => {
    const response = await axiosInstance.get("mentorship/guidance/my-requests/", { params });
    return response.data;
  },

  acceptGuidanceRequest: async (requestId) => {
    const response = await axiosInstance.post(
      `mentorship/guidance/request/${requestId}/accept/`
    );
    return response.data;
  },

  rejectGuidanceRequest: async (requestId) => {
    const response = await axiosInstance.post(
      `mentorship/guidance/request/${requestId}/reject/`
    );
    return response.data;
  },

  // ========================================================================
  // Collaboration Requests (Peer → Peer)
  // ========================================================================

  createCollaborationRequest: async (circleId, peerId, data) => {
    const response = await axiosInstance.post(
      `mentorship/collaboration/request/${circleId}/${peerId}/`,
      data
    );
    return response.data;
  },

  getMyCollaborationRequests: async (params = {}) => {
    const response = await axiosInstance.get("mentorship/collaboration/my-requests/", {
      params,
    });
    return response.data;
  },

  acceptCollaborationRequest: async (requestId) => {
    const response = await axiosInstance.post(
      `mentorship/collaboration/request/${requestId}/accept/`
    );
    return response.data;
  },

  rejectCollaborationRequest: async (requestId) => {
    const response = await axiosInstance.post(
      `mentorship/collaboration/request/${requestId}/reject/`
    );
    return response.data;
  },

  // ========================================================================
  // Conversations
  // ========================================================================

  getMyConversations: async (params = {}) => {
    const response = await axiosInstance.get("mentorship/conversations/", { params });
    return response.data;
  },

  getConversation: async (conversationId) => {
    const response = await axiosInstance.get(`mentorship/conversations/${conversationId}/`);
    return response.data;
  },

  getMessages: async (conversationId, params = {}) => {
    const response = await axiosInstance.get(
      `mentorship/conversations/${conversationId}/messages/`,
      { params }
    );
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await axiosInstance.post(
      `mentorship/conversations/${conversationId}/messages/send/`,
      { content }
    );
    return response.data;
  },

  // ========================================================================
  // User Profile
  // ========================================================================

  getUserProfile: async (userId) => {
    const response = await axiosInstance.get(`mentorship/users/${userId}/profile/`);
    return response.data;
  },
};
