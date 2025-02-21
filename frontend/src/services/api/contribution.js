import api from "./axios.config";

export const contributionService = {
  createContribution: async (contributionData) => {
    try {
      const response = await api.post("/contributions", contributionData);
      return response.data;
    } catch (error) {
      console.error("[Contribution Service] Create Error:", error);
      throw error.response?.data || error;
    }
  },

  getEventContributions: async (eventId) => {
    try {
      const response = await api.get(`/contributions/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(
        "[Contribution Service] Get Event Contributions Error:",
        error
      );
      throw error.response?.data || error;
    }
  },

  getUserContributions: async () => {
    try {
      const response = await api.get("/contributions/user");
      return response.data;
    } catch (error) {
      console.error(
        "[Contribution Service] Get User Contributions Error:",
        error
      );
      throw error.response?.data || error;
    }
  },
};
