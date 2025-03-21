// backend/src/utils/notifications.js
const User = require("../models/user");

/**
 * Send a notification to a user
 * This is a basic implementation - in a production app, you might:
 * 1. Use WebSockets for real-time notifications
 * 2. Integrate with a messaging service like Firebase Cloud Messaging
 * 3. Implement email notifications
 * 4. Use a notification database model
 */
exports.sendNotification = async ({
  userId,
  title,
  message,
  type,
  referenceId,
}) => {
  try {
    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // In a real implementation, you would:
    // 1. Save notification to database
    // 2. Push to connected clients via WebSocket
    // 3. Send email/SMS if needed

    console.log(
      `Notification sent to ${user.name} (${userId}): ${title} - ${message}`
    );

    // For now, we'll just return a successful result
    return {
      success: true,
      recipient: userId,
      title,
      message,
      type,
      referenceId,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * Send a batch of notifications to multiple users
 */
exports.sendBatchNotifications = async (notifications) => {
  const results = [];

  for (const notification of notifications) {
    try {
      const result = await exports.sendNotification(notification);
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
};

module.exports = exports;
