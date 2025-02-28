// src/services/api/analytics.js
import api from "./axios.config";

/**
 * Service for handling seller analytics data
 */
export const analyticsService = {
  /**
   * Get seller dashboard overview data
   * @returns {Promise<Object>} Dashboard overview data
   */
  getDashboardOverview: async () => {
    try {
      const response = await api.get("/seller/analytics/overview");
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Overview Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch dashboard overview",
          error: error.message,
        }
      );
    }
  },

  /**
   * Get sales analytics data
   * @param {string} period - 'daily', 'weekly', or 'monthly'
   * @returns {Promise<Object>} Sales analytics data
   */
  getSalesAnalytics: async (period = "weekly") => {
    try {
      const response = await api.get("/seller/analytics/sales", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Sales Analytics Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch sales analytics",
          error: error.message,
        }
      );
    }
  },

  /**
   * Get product performance analytics
   * @returns {Promise<Object>} Product performance data
   */
  getProductPerformance: async () => {
    try {
      const response = await api.get("/seller/analytics/products");
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Product Performance Error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to fetch product performance",
          error: error.message,
        }
      );
    }
  },
};

export default analyticsService;
