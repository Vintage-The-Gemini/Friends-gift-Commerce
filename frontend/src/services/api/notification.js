// frontend/src/services/api/notification.js
import api from "./axios.config";

const ENDPOINTS = {
  BASE: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
  MARK_READ: "/notifications/read",
  DELETE: "/notifications",
  TEST: "/notifications/test", // Development only
};

export const notificationService = {
  // Get user notifications with pagination
  getUserNotifications: async (options = {}) => {
    try {
      const { page = 1, limit = 20, onlyUnread = false, type } = options;
      
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (onlyUnread) params.append("onlyUnread", "true");
      if (type) params.append("type", type);

      const response = await api.get(`${ENDPOINTS.BASE}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Get notifications error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to fetch notifications" 
      };
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await api.get(ENDPOINTS.UNREAD_COUNT);
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Get unread count error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to get unread count" 
      };
    }
  },

  // Mark notification(s) as read
  markAsRead: async ({ notificationId, all = false }) => {
    try {
      const payload = { all };
      if (!all && notificationId) {
        payload.notificationId = notificationId;
      }

      const response = await api.put(ENDPOINTS.MARK_READ, payload);
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Mark as read error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to mark notification as read" 
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put(ENDPOINTS.MARK_READ, { all: true });
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Mark all as read error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to mark all notifications as read" 
      };
    }
  },

  // Delete notification(s)
  deleteNotification: async ({ notificationId, all = false }) => {
    try {
      const payload = { all };
      if (!all && notificationId) {
        payload.notificationId = notificationId;
      }

      const response = await api.delete(ENDPOINTS.DELETE, { data: payload });
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Delete notification error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to delete notification" 
      };
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete(ENDPOINTS.DELETE, { data: { all: true } });
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Delete all notifications error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to delete all notifications" 
      };
    }
  },

  // Create test notification (development only)
  createTestNotification: async ({ type, title, message }) => {
    try {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Test notifications are not available in production");
      }

      const response = await api.post(ENDPOINTS.TEST, {
        type: type || "welcome",
        title: title || "Test Notification",
        message: message || "This is a test notification.",
      });
      return response.data;
    } catch (error) {
      console.error("[Notification Service] Create test notification error:", error);
      throw error.response?.data || { 
        success: false, 
        message: "Failed to create test notification" 
      };
    }
  },
};

export default notificationService;