// src/services/api/order.js
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

  updateOrderStatus: async (orderId, status, details = {}) => {
    try {
      const payload = {
        status,
        description: details.description || `Order status updated to ${status}`,
        ...details,
      };

      const response = await api.patch(`/orders/${orderId}/status`, payload);
      return response.data;
    } catch (error) {
      console.error("[Order Service] Update Status Error:", error);
      throw error.response?.data || error;
    }
  },

  updateOrderShipping: async (orderId, shippingDetails) => {
    try {
      const response = await api.patch(
        `/orders/${orderId}/shipping`,
        shippingDetails
      );
      return response.data;
    } catch (error) {
      console.error("[Order Service] Update Shipping Error:", error);
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

  cancelOrder: async (orderId, reason) => {
    try {
      const response = await api.delete(`/orders/${orderId}`, {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      console.error("[Order Service] Cancel Order Error:", error);
      throw error.response?.data || error;
    }
  },

  // For viewing a specific order with detailed information
  getOrderDetails: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("[Order Service] Get Order Details Error:", error);
      throw error.response?.data || error;
    }
  },

  // For seller to add tracking information
  addTracking: async (orderId, trackingInfo) => {
    try {
      const response = await api.patch(
        `/orders/${orderId}/tracking`,
        trackingInfo
      );
      return response.data;
    } catch (error) {
      console.error("[Order Service] Add Tracking Error:", error);
      throw error.response?.data || error;
    }
  },
};

export default orderService;
