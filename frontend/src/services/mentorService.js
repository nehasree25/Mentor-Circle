import api from "../api/axios";

export const getMentors = async (params = {}) => {
  const { data } = await api.get("mentors/", { params });
  return data;
};

export const getMentorDetail = async (mentorId) => {
  const { data } = await api.get(`mentors/${mentorId}/`);
  return data;
};

export const mentorService = {
  getMentors,
  getMentorDetail,
};
