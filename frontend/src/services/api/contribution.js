// src/services/api/contribution.js
import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  BASE: "/contributions",
  EVENT: (eventId) => `/contributions/event/${eventId}`,
  DETAIL: (id) => `/contributions/${id}`,
  USER: "/contributions/user",
};

// Handle API errors consistently
const handleApiError = (error, defaultMessage) => {
  console.error("[Contribution Service] Error:", error);

  if (error.response) {
    // Create enhanced error with additional properties
    const enhancedError = new Error(
      error.response.data?.message || defaultMessage
    );

    // Add useful properties to the error
    enhancedError.status = error.response.status;
    enhancedError.response = error.response;

    throw enhancedError;
  }

  // If no response, throw generic error
  throw (
    error.response?.data || {
      success: false,
      message: defaultMessage,
      error: error.message,
    }
  );
};

export const contributionService = {
  // Create a new contribution for an event
  createContribution: async (contributionData) => {
    try {
      console.log("Creating contribution with data:", contributionData);

      const response = await api.post(ENDPOINTS.BASE, contributionData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to process contribution");
    }
  },

  // Get event-specific contributions
  getEventContributions: async (eventId, params = {}) => {
    try {
      const response = await api.get(ENDPOINTS.EVENT(eventId), { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch event contributions");
    }
  },

  // Get user's contributions
  getUserContributions: async (params = {}) => {
    try {
      const response = await api.get(ENDPOINTS.USER, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch your contributions");
    }
  },

  // Get a specific contribution
  getContribution: async (id) => {
    try {
      const response = await api.get(ENDPOINTS.DETAIL(id));
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch contribution details");
    }
  },

  // Create product-specific contribution
  createProductContribution: async (contributionData) => {
    try {
      // Ensure product-specific data is included
      if (!contributionData.productId) {
        throw new Error("Product ID is required for product contributions");
      }

      const response = await api.post(
        `${ENDPOINTS.BASE}/product`,
        contributionData
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to process product contribution");
    }
  },

  // Get contribution statistics
  getContributionStats: async (params = {}) => {
    try {
      const response = await api.get(`${ENDPOINTS.BASE}/stats`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch contribution statistics");
    }
  },

  // Process payment for a contribution (M-PESA)
  processMpesaPayment: async (contributionId, paymentData) => {
    try {
      const response = await api.post(
        `${ENDPOINTS.DETAIL(contributionId)}/mpesa`,
        paymentData
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to process M-PESA payment");
    }
  },

  // Process payment for a contribution (Card)
  processCardPayment: async (contributionId, paymentData) => {
    try {
      const response = await api.post(
        `${ENDPOINTS.DETAIL(contributionId)}/card`,
        paymentData
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to process card payment");
    }
  },

  // Check M-PESA payment status
  checkMpesaStatus: async (contributionId) => {
    try {
      const response = await api.get(
        `${ENDPOINTS.DETAIL(contributionId)}/mpesa-status`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to check payment status");
    }
  },
};

export default contributionService;