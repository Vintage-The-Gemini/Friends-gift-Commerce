// src/services/api/analytics.js
import api from "./axios.config";

export const analyticsService = {
  /**
   * Get seller dashboard overview
   * @returns {Promise} Dashboard overview data
   */
  getDashboardOverview: async () => {
    try {
      console.log("Calling analytics/overview endpoint");
      const response = await api.get("/seller/analytics/overview");
      console.log("Dashboard overview response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Overview Error:", error);
      throw (
        error.response?.data ||
        new Error(error.message || "Failed to fetch dashboard overview")
      );
    }
  },

  /**
   * Get sales analytics
   * @param {string} period - 'daily', 'weekly', or 'monthly'
   * @returns {Promise} Sales analytics data
   */
  getSalesAnalytics: async (period = "weekly") => {
    try {
      console.log(`Calling analytics/sales endpoint with period=${period}`);
      const response = await api.get("/seller/analytics/sales", {
        params: { period },
      });
      console.log("Sales analytics response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[Analytics Service] Sales Analytics Error:", error);
      throw (
        error.response?.data ||
        new Error(error.message || "Failed to fetch sales analytics")
      );
    }
  },
};

export default analyticsService;
