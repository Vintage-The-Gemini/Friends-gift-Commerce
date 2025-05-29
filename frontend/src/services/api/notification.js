// frontend/src/services/api/notification.js - COMPLETE FRONTEND SERVICE
import api from "./axios.config";

// API endpoints
const ENDPOINTS = {
  BASE: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
  STATS: "/notifications/stats",
  MARK_READ: "/notifications/read",
  MARK_ALL_READ: "/notifications/mark-all-read",
  PREFERENCES: "/notifications/preferences",
  TEST: "/notifications/test",
  DETAIL: (id) => `/notifications/${id}`,
};

// Helper function to handle API errors
const handleApiError = (error, defaultMessage) => {
  console.error("[Notification Service] Error:", error);

  if (error.response) {
    const enhancedError = new Error(
      error.response.data?.message || defaultMessage
    );
    enhancedError.status = error.response.status;
    enhancedError.response = error.response;
    throw enhancedError;
  }

  throw (
    error.response?.data || {
      success: false,
      message: defaultMessage,
      error: error.message,
    }
  );
};

export const notificationService = {
  /**
   * Get user notifications with pagination and filters
   */
  getUserNotifications: async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        onlyUnread = false,
        type = null,
        priority = null
      } = options;

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      
      if (onlyUnread) params.append("onlyUnread", "true");
      if (type) params.append("type", type);
      if (priority) params.append("priority", priority);

      const response = await api.get(`${ENDPOINTS.BASE}?${params.toString()}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch notifications");
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get(ENDPOINTS.UNREAD_COUNT);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch unread count");
    }
  },

  /**
   * Get notification statistics
   */
  getNotificationStats: async () => {
    try {
      const response = await api.get(ENDPOINTS.STATS);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch notification statistics");
    }
  },

  /**
   * Get single notification by ID
   */
  getNotification: async (notificationId) => {
    try {
      if (!notificationId) {
        throw new Error("Notification ID is required");
      }

      const response = await api.get(ENDPOINTS.DETAIL(notificationId));
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch notification");
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async ({ notificationId, all = false }) => {
    try {
      const payload = { all };
      if (notificationId && !all) {
        payload.notificationId = notificationId;
      }

      const response = await api.put(ENDPOINTS.MARK_READ, payload);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to mark notification as read");
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.put(ENDPOINTS.MARK_ALL_READ);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to mark all notifications as read");
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async ({ notificationId, all = false }) => {
    try {
      const payload = { all };
      if (notificationId && !all) {
        payload.notificationId = notificationId;
      }

      const response = await api.delete(ENDPOINTS.BASE, { data: payload });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete notification");
    }
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete(ENDPOINTS.BASE, { 
        data: { all: true } 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete all notifications");
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put(ENDPOINTS.PREFERENCES, { preferences });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to update notification preferences");
    }
  },

  /**
   * Create test notification (development only)
   */
  createTestNotification: async (options = {}) => {
    try {
      const {
        type = "welcome",
        title = "Test Notification",
        message = "This is a test notification"
      } = options;

      const response = await api.post(ENDPOINTS.TEST, {
        type,
        title,
        message
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to create test notification");
    }
  },

  /**
   * Get notification types and their descriptions
   */
  getNotificationTypes: () => {
    return {
      // Event-related
      event_contribution: {
        name: "Event Contributions",
        description: "When someone contributes to your events"
      },
      event_target_reached: {
        name: "Target Reached",
        description: "When your event reaches its funding goal"
      },
      event_ending_soon: {
        name: "Event Ending Soon",
        description: "Reminders when your events are about to end"
      },
      event_completed: {
        name: "Event Completed",
        description: "When your events are successfully completed"
      },
      
      // Product-related (for sellers)
      product_approved: {
        name: "Product Approved",
        description: "When your products are approved for sale"
      },
      product_rejected: {
        name: "Product Rejected",
        description: "When your products need changes"
      },
      new_order: {
        name: "New Orders",
        description: "When you receive new orders"
      },
      order_updated: {
        name: "Order Updates",
        description: "When your order status changes"
      },
      
      // Payment-related
      payment_received: {
        name: "Payment Confirmed",
        description: "When your payments are processed"
      },
      payment_failed: {
        name: "Payment Failed",
        description: "When payments fail to process"
      },
      
      // General
      welcome: {
        name: "Welcome Messages",
        description: "Platform welcome and introduction messages"
      },
      invitation_received: {
        name: "Event Invitations",
        description: "When you're invited to events"
      },
      reminder: {
        name: "Reminders",
        description: "General reminders and alerts"
      }
    };
  },

  /**
   * Get default notification preferences
   */
  getDefaultPreferences: () => {
    return {
      email: {
        event_contribution: true,
        event_target_reached: true,
        event_ending_soon: true,
        product_approved: true,
        product_rejected: true,
        new_order: true,
        order_updated: true,
        payment_received: true,
        payment_failed: true,
        welcome: true,
        invitation_received: true,
        reminder: true
      },
      push: {
        event_contribution: true,
        event_target_reached: true,
        event_ending_soon: false,
        product_approved: true,
        product_rejected: true,
        new_order: true,
        order_updated: false,
        payment_received: true,
        payment_failed: true,
        welcome: false,
        invitation_received: true,
        reminder: false
      },
      inApp: {
        event_contribution: true,
        event_target_reached: true,
        event_ending_soon: true,
        product_approved: true,
        product_rejected: true,
        new_order: true,
        order_updated: true,
        payment_received: true,
        payment_failed: true,
        welcome: true,
        invitation_received: true,
        reminder: true
      }
    };
  },

  /**
   * Format notification for display
   */
  formatNotification: (notification) => {
    const types = notificationService.getNotificationTypes();
    const typeInfo = types[notification.type] || { name: notification.type };

    return {
      ...notification,
      typeName: typeInfo.name,
      formattedTime: formatRelativeTime(notification.createdAt),
      icon: getNotificationIcon(notification.type),
      priorityColor: getPriorityColor(notification.priority)
    };
  },

  /**
   * Group notifications by date
   */
  groupNotificationsByDate: (notifications) => {
    const grouped = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      let dateKey;

      if (isSameDay(notificationDate, today)) {
        dateKey = "Today";
      } else if (isSameDay(notificationDate, yesterday)) {
        dateKey = "Yesterday";
      } else if (isThisWeek(notificationDate)) {
        dateKey = notificationDate.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        dateKey = notificationDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });

    return grouped;
  }
};

// Helper functions

/**
 * Format relative time
 */
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Get notification icon
 */
const getNotificationIcon = (type) => {
  const iconMap = {
    event_contribution: "💰",
    event_target_reached: "🎉",
    event_ending_soon: "⏰",
    event_completed: "✅",
    product_approved: "✅",
    product_rejected: "❌",
    new_order: "🛍️",
    order_updated: "📦",
    payment_received: "💳",
    payment_failed: "⚠️",
    welcome: "👋",
    invitation_received: "📮",
    reminder: "🔔"
  };
  return iconMap[type] || "🔔";
};

/**
 * Get priority color
 */
const getPriorityColor = (priority) => {
  const colorMap = {
    low: "text-gray-500",
    normal: "text-blue-500",
    high: "text-orange-500",
    urgent: "text-red-500"
  };
  return colorMap[priority] || colorMap.normal;
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

/**
 * Check if date is in this week
 */
const isThisWeek = (date) => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  return date >= startOfWeek;
};

export default notificationService;