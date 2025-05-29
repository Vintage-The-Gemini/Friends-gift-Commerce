// backend/src/routes/notification.routes.js - COMPLETE ROUTES
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotification,
  getNotificationStats,
  updateNotificationPreferences,
  testNotification
} = require("../controllers/notificationController");

// All notification routes require authentication
router.use(protect);

// ====================
// CORE NOTIFICATION ROUTES
// ====================

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications with pagination and filters
 * @access  Private
 * @params  page, limit, onlyUnread, type, priority
 */
router.get("/", getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get("/unread-count", getUnreadCount);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics for user
 * @access  Private
 */
router.get("/stats", getNotificationStats);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get single notification by ID
 * @access  Private
 */
router.get("/:id", getNotification);

// ====================
// NOTIFICATION ACTIONS
// ====================

/**
 * @route   PUT /api/notifications/read
 * @desc    Mark notification(s) as read
 * @access  Private
 * @body    { notificationId?, all? }
 */
router.put("/read", markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/mark-all-read", markAllAsRead);

/**
 * @route   DELETE /api/notifications
 * @desc    Delete notification(s)
 * @access  Private
 * @body    { notificationId?, all? }
 */
router.delete("/", deleteNotification);

// ====================
// PREFERENCES & SETTINGS
// ====================

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 * @body    { preferences }
 */
router.put("/preferences", updateNotificationPreferences);

// ====================
// DEVELOPMENT & TESTING
// ====================

/**
 * @route   POST /api/notifications/test
 * @desc    Create test notification (development only)
 * @access  Private
 * @body    { type?, title?, message? }
 */
router.post("/test", testNotification);

module.exports = router;