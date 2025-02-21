import api from "./axios.config";

export const orderService = {
  getOrders: async (params = {}) => {
    try {
      const response = await api.get("/orders", { params });
      return response.data;
    } catch (error) {
      console.error("[Order Service] Get Orders Error:", error);
      throw error.response?.data || error;
    }
  },

  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("[Order Service] Get Order Error:", error);
      throw error.response?.data || error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      console.error("[Order Service] Update Status Error:", error);
      throw error.response?.data || error;
    }
  },

  getStats: async (period = "weekly") => {
    try {
      const response = await api.get("/orders/stats", { params: { period } });
      return response.data;
    } catch (error) {
      console.error("[Order Service] Get Stats Error:", error);
      throw error.response?.data || error;
    }
  },
};
