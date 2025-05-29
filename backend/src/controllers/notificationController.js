// backend/src/controllers/notificationController.js - COMPLETE VERSION
const Notification = require("../models/notification");
const User = require("../models/user");
const Event = require("../models/Event");
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

/**
 * Get all notifications for the authenticated user
 * @route GET /api/notifications
 * @access Private
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      onlyUnread = false,
      type = null,
      priority = null 
    } = req.query;
    
    // Build query
    const query = { recipient: userId };
    if (onlyUnread === "true") {
      query.isRead = false;
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }
    
    // Pagination
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = Math.min(parseInt(limit) || 10, 50); // Max 50 items
    const skip = (currentPage - 1) * itemsPerPage;
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .populate("relatedEntity.entityId", "title name")
      .lean();
    
    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    // Add actionUrl to each notification
    const notificationsWithActions = notifications.map(notification => ({
      ...notification,
      actionUrl: generateActionUrl(notification)
    }));
    
    res.status(200).json({
      success: true,
      data: notificationsWithActions,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages: Math.ceil(total / itemsPerPage),
        hasNext: currentPage < Math.ceil(total / itemsPerPage),
        hasPrev: currentPage > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

/**
 * Mark notification(s) as read
 * @route PUT /api/notifications/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId, all = false } = req.body;
    
    let result;
    
    if (all) {
      // Mark all notifications as read
      result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
      
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: { modifiedCount: result.modifiedCount }
      });
    } else {
      // Mark specific notification as read
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required"
        });
      }
      
      const notification = await Notification.findOneAndUpdate(
        { 
          _id: notificationId, 
          recipient: userId 
        },
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification
      });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/mark-all-read
 * @access Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

/**
 * Delete notification(s)
 * @route DELETE /api/notifications
 * @access Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId, all = false } = req.body;
    
    let result;
    
    if (all) {
      // Delete all notifications
      result = await Notification.deleteMany({ recipient: userId });
      
      res.status(200).json({
        success: true,
        message: "All notifications deleted",
        data: { deletedCount: result.deletedCount }
      });
    } else {
      // Delete specific notification
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required"
        });
      }
      
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Notification deleted"
      });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * Get notification by ID
 * @route GET /api/notifications/:id
 * @access Private
 */
exports.getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    }).populate("relatedEntity.entityId", "title name");
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    // Add action URL
    const notificationWithAction = {
      ...notification.toObject(),
      actionUrl: generateActionUrl(notification)
    };
    
    res.status(200).json({
      success: true,
      data: notificationWithAction
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

/**
 * Get notification statistics
 * @route GET /api/notifications/stats
 * @access Private
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get overall stats
    const totalNotifications = await Notification.countDocuments({ recipient: userId });
    const unreadNotifications = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });
    
    // Get stats by type
    const typeStats = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get stats by priority
    const priorityStats = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await Notification.aggregate([
      { 
        $match: { 
          recipient: userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalNotifications,
          unread: unreadNotifications,
          readPercentage: totalNotifications > 0 
            ? ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(1)
            : 0
        },
        byType: typeStats,
        byPriority: priorityStats,
        recentActivity
      }
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message,
    });
  }
};

/**
 * Update notification preferences
 * @route PUT /api/notifications/preferences
 * @access Private
 */
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;
    
    // Update user's notification preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          "notificationPreferences": preferences 
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Notification preferences updated",
      data: user.notificationPreferences
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
};

/**
 * Test notification (Development only)
 * @route POST /api/notifications/test
 * @access Private
 */
exports.testNotification = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Test notifications are not available in production"
      });
    }
    
    const userId = req.user._id;
    const { type = "welcome", title, message } = req.body;
    
    const notification = await Notification.create({
      recipient: userId,
      type,
      title: title || "Test Notification",
      message: message || "This is a test notification to verify the system is working correctly.",
      priority: "normal",
      data: {
        isTest: true,
        timestamp: new Date()
      }
    });
    
    res.status(201).json({
      success: true,
      message: "Test notification created",
      data: notification
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notification",
      error: error.message,
    });
  }
};

// Helper Functions

/**
 * Generate action URL for notification
 */
function generateActionUrl(notification) {
  if (!notification.relatedEntity?.entityType || !notification.relatedEntity?.entityId) {
    return null;
  }

  const baseUrls = {
    Event: `/events/${notification.relatedEntity.entityId}`,
    Product: `/products/${notification.relatedEntity.entityId}`,
    Order: `/orders/${notification.relatedEntity.entityId}`,
    Contribution: `/dashboard/contributions`,
    User: `/profile`
  };

  return baseUrls[notification.relatedEntity.entityType] || null;
}

/**
 * Create notification helper
 */
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Emit real-time notification if WebSocket is available
    if (global.io) {
      global.io.to(`user_${data.recipient}`).emit("new_notification", {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        createdAt: notification.createdAt,
        actionUrl: generateActionUrl(notification),
      });
    }
    
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Bulk create notifications
 */
exports.bulkCreateNotifications = async (notifications) => {
  try {
    const createdNotifications = await Notification.insertMany(notifications);
    
    // Emit real-time notifications
    if (global.io) {
      createdNotifications.forEach(notification => {
        global.io.to(`user_${notification.recipient}`).emit("new_notification", {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          createdAt: notification.createdAt,
          actionUrl: generateActionUrl(notification),
        });
      });
    }
    
    return createdNotifications;
  } catch (error) {
    console.error("Error bulk creating notifications:", error);
    throw error;
  }
};

module.exports = exports;