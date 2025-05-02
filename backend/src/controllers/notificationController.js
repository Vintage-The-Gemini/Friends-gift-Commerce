// backend/src/controllers/notificationController.js
const Notification = require("../models/notification");
const notificationService = require("../utils/notifications");

/**
 * Get all notifications for the authenticated user
 * @route GET /api/notifications
 * @access Private
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, onlyUnread = false } = req.query;
    
    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      onlyUnread: onlyUnread === "true",
    });
    
    res.status(200).json({
      success: true,
      notifications: result.notifications,
      pagination: result.pagination,
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
 * Mark a notification as read
 * @route PUT /api/notifications/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId, all = false } = req.body;
    
    const result = await notificationService.markAsRead({
      userId,
      notificationId,
      all,
    });
    
    res.status(200).json({
      success: true,
      message: all ? "All notifications marked as read" : "Notification marked as read",
      data: result.data,
    });
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
 * Delete a notification
 * @route DELETE /api/notifications
 * @access Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId, all = false } = req.body;
    
    const result = await notificationService.deleteNotifications({
      userId,
      notificationId,
      all,
    });
    
    res.status(200).json({
      success: true,
      message: all ? "All notifications deleted" : "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};