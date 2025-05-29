// backend/src/models/notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Event-related notifications
      "event_contribution",
      "event_target_reached",
      "event_ending_soon",
      "event_expired",
      "event_checkout_ready",
      "event_completed",
      
      // Product-related notifications (for sellers)
      "product_approved",
      "product_rejected",
      "product_out_of_stock",
      "new_order",
      "order_updated",
      "order_shipped",
      "order_delivered",
      
      // General notifications
      "welcome",
      "profile_updated",
      "payment_received",
      "payment_failed",
      "invitation_received",
      "reminder",
    ],
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  data: {
    // Additional data related to the notification
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ["Event", "Product", "Order", "Contribution", "User"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
  },
  expiresAt: {
    type: Date,
    // Auto-delete notifications after 30 days
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for URL generation
notificationSchema.virtual("actionUrl").get(function() {
  if (!this.relatedEntity.entityType || !this.relatedEntity.entityId) {
    return null;
  }

  const baseUrls = {
    Event: `/events/${this.relatedEntity.entityId}`,
    Product: `/products/${this.relatedEntity.entityId}`,
    Order: `/orders/${this.relatedEntity.entityId}`,
    Contribution: `/dashboard/contributions`,
  };

  return baseUrls[this.relatedEntity.entityType] || null;
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Emit real-time notification if WebSocket is available
  if (global.io) {
    global.io.to(`user_${data.recipient}`).emit("new_notification", {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      actionUrl: notification.actionUrl,
    });
  }
  
  return notification;
};

module.exports = mongoose.model("Notification", notificationSchema);