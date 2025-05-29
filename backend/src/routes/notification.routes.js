// backend/src/routes/notification.routes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const notificationService = require("../services/notificationService");

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, onlyUnread = false, type } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      onlyUnread: onlyUnread === "true",
      type,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
        unreadCount: result.unreadCount,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in GET /notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get("/unread-count", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.getUnreadCount(userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        count: result.count,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to get unread count",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in GET /notifications/unread-count:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/notifications/read
 * @desc    Mark notification(s) as read
 * @access  Private
 */
router.put("/read", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId, all = false } = req.body;

    if (!all && !notificationId) {
      return res.status(400).json({
        success: false,
        message: "Either notificationId or all=true is required",
      });
    }

    const result = await notificationService.markAsRead({
      userId,
      notificationId,
      all,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in PUT /notifications/read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete notification(s)
 * @access  Private
 */
router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId, all = false } = req.body;

    if (!all && !notificationId) {
      return res.status(400).json({
        success: false,
        message: "Either notificationId or all=true is required",
      });
    }

    const result = await notificationService.deleteNotifications({
      userId,
      notificationId,
      all,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in DELETE /notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Create a test notification (development only)
 * @access  Private
 */
if (process.env.NODE_ENV !== "production") {
  router.post("/test", protect, async (req, res) => {
    try {
      const userId = req.user._id;
      const { type = "welcome", title, message } = req.body;

      const result = await notificationService.createNotification({
        recipientId: userId,
        type,
        title: title || "Test Notification",
        message: message || "This is a test notification.",
        priority: "normal",
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: "Test notification created",
          data: result.notification,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to create test notification",
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in POST /notifications/test:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  });
}

module.exports = router;