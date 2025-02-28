// src/services/api/contribution.js
import api from "./axios.config";

const ENDPOINTS = {
  BASE: "/contributions",
  EVENT: (id) => `/contributions/event/${id}`,
  USER: "/contributions/user",
};

export const contributionService = {
  /**
   * Create a new contribution for an event
   * @param {Object} contributionData - Contribution data
   * @param {string} contributionData.eventId - ID of the event
   * @param {number} contributionData.amount - Contribution amount
   * @param {string} contributionData.paymentMethod - Payment method (mpesa, card)
   * @param {string} contributionData.phoneNumber - Phone number for M-PESA
   * @param {string} contributionData.message - Optional message
   * @param {boolean} contributionData.anonymous - Whether to hide contributor's identity
   * @returns {Promise<Object>} API response
   */
  createContribution: async (contributionData) => {
    try {
      const response = await api.post(ENDPOINTS.BASE, contributionData);
      return response.data;
    } catch (error) {
      console.error("[Contribution Service] Create Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to make contribution",
          error: error.message,
        }
      );
    }
  },

  /**
   * Get contributions for a specific event
   * @param {string} eventId - ID of the event
   * @returns {Promise<Object>} API response with contributions
   */
  getEventContributions: async (eventId) => {
    try {
      const response = await api.get(ENDPOINTS.EVENT(eventId));
      return response.data;
    } catch (error) {
      console.error(
        "[Contribution Service] Get Event Contributions Error:",
        error
      );
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch contributions",
          error: error.message,
        }
      );
    }
  },

  /**
   * Get contributions made by the current user
   * @returns {Promise<Object>} API response with user's contributions
   */
  getUserContributions: async () => {
    try {
      const response = await api.get(ENDPOINTS.USER);
      return response.data;
    } catch (error) {
      console.error(
        "[Contribution Service] Get User Contributions Error:",
        error
      );
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch your contributions",
          error: error.message,
        }
      );
    }
  },

  /**
   * Get a specific contribution by ID
   * @param {string} contributionId - ID of the contribution
   * @returns {Promise<Object>} API response with contribution details
   */
  getContribution: async (contributionId) => {
    try {
      const response = await api.get(`${ENDPOINTS.BASE}/${contributionId}`);
      return response.data;
    } catch (error) {
      console.error("[Contribution Service] Get Contribution Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch contribution details",
          error: error.message,
        }
      );
    }
  },
};

export default contributionService;
