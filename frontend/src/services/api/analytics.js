// src/services/api/analytics.js
import api from "./axios.config";

export const analyticsService = {
  /**
   * Get seller dashboard overview
   * @returns {Promise} Dashboard overview data
   */
  getDashboardOverview: async () => {
    try {
      const response = await api.get("/seller/analytics/overview");
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Overview Error:", error);
      throw new Error(error.message || "Failed to fetch dashboard overview");
    }
  },

  /**
   * Get sales analytics
   * @param {string} period - 'daily', 'weekly', or 'monthly'
   * @returns {Promise} Sales analytics data
   */
  getSalesAnalytics: async (period = "weekly") => {
    try {
      const response = await api.get(`/seller/analytics/sales`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Sales Analytics Error:", error);
      throw new Error(error.message || "Failed to fetch sales analytics");
    }
  },
};
