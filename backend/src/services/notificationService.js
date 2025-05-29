// backend/src/services/notificationService.js
const Notification = require("../models/notification");
const User = require("../models/user");

class NotificationService {
  // Core notification creation method
  async createNotification({
    recipientId,
    type,
    title,
    message,
    data = {},
    relatedEntity = {},
    priority = "normal"
  }) {
    try {
      const notification = await Notification.createNotification({
        recipient: recipientId,
        type,
        title,
        message,
        data,
        relatedEntity,
        priority,
      });

      return { success: true, notification };
    } catch (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Get user notifications with pagination
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        onlyUnread = false,
        type = null,
      } = options;

      const query = { recipient: userId };
      if (onlyUnread) query.isRead = false;
      if (type) query.type = type;

      const notifications = await Notification.find(query)
        .populate("relatedEntity.entityId")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.getUnreadCount(userId);

      return {
        success: true,
        notifications: notifications.map(n => ({
          ...n,
          actionUrl: this.generateActionUrl(n.relatedEntity)
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message };
    }
  }

  // Mark notifications as read
  async markAsRead({ userId, notificationId, all = false }) {
    try {
      if (all) {
        await Notification.markAllAsRead(userId);
        return { success: true, message: "All notifications marked as read" };
      } else {
        const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, recipient: userId },
          { isRead: true },
          { new: true }
        );

        if (!notification) {
          return { success: false, message: "Notification not found" };
        }

        return { success: true, data: notification };
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message };
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.getUnreadCount(userId);
      return { success: true, count };
    } catch (error) {
      console.error("Error getting unread count:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete notifications
  async deleteNotifications({ userId, notificationId, all = false }) {
    try {
      if (all) {
        await Notification.deleteMany({ recipient: userId });
        return { success: true, message: "All notifications deleted" };
      } else {
        const result = await Notification.findOneAndDelete({
          _id: notificationId,
          recipient: userId,
        });

        if (!result) {
          return { success: false, message: "Notification not found" };
        }

        return { success: true, message: "Notification deleted" };
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
      return { success: false, error: error.message };
    }
  }

  // Generate action URL for notifications
  generateActionUrl(relatedEntity) {
    if (!relatedEntity?.entityType || !relatedEntity?.entityId) {
      return null;
    }

    const baseUrls = {
      Event: `/events/${relatedEntity.entityId}`,
      Product: `/products/${relatedEntity.entityId}`,
      Order: `/orders/${relatedEntity.entityId}`,
      Contribution: `/dashboard/contributions`,
    };

    return baseUrls[relatedEntity.entityType] || null;
  }

  // ===== SPECIFIC NOTIFICATION CREATORS =====

  // Event-related notifications
  async notifyEventContribution(eventId, contributorId, eventCreatorId, amount) {
    const contributor = await User.findById(contributorId);
    
    return this.createNotification({
      recipientId: eventCreatorId,
      type: "event_contribution",
      title: "New Contribution!",
      message: `${contributor?.name || "Someone"} contributed $${amount} to your event`,
      data: { amount, contributorId },
      relatedEntity: { entityType: "Event", entityId: eventId },
      priority: "high",
    });
  }

  async notifyEventTargetReached(eventId, eventCreatorId) {
    return this.createNotification({
      recipientId: eventCreatorId,
      type: "event_target_reached",
      title: "🎉 Target Reached!",
      message: "Your event has reached its funding target! Time to checkout.",
      relatedEntity: { entityType: "Event", entityId: eventId },
      priority: "high",
    });
  }

  async notifyEventEndingSoon(eventId, eventCreatorId, daysLeft) {
    return this.createNotification({
      recipientId: eventCreatorId,
      type: "event_ending_soon",
      title: "Event Ending Soon",
      message: `Your event ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Consider checking out if you've reached your goal.`,
      relatedEntity: { entityType: "Event", entityId: eventId },
      priority: "normal",
    });
  }

  async notifyEventExpired(eventId, eventCreatorId) {
    return this.createNotification({
      recipientId: eventCreatorId,
      type: "event_expired",
      title: "Event Expired",
      message: "Your event has expired. You can still checkout if you've received contributions.",
      relatedEntity: { entityType: "Event", entityId: eventId },
      priority: "normal",
    });
  }

  // Product-related notifications (for sellers)
  async notifyProductApproved(productId, sellerId) {
    return this.createNotification({
      recipientId: sellerId,
      type: "product_approved",
      title: "Product Approved! ✅",
      message: "Your product has been approved and is now visible to customers.",
      relatedEntity: { entityType: "Product", entityId: productId },
      priority: "high",
    });
  }

  async notifyProductRejected(productId, sellerId, reason) {
    return this.createNotification({
      recipientId: sellerId,
      type: "product_rejected",
      title: "Product Needs Updates",
      message: `Your product was not approved. Reason: ${reason}`,
      data: { reason },
      relatedEntity: { entityType: "Product", entityId: productId },
      priority: "high",
    });
  }

  async notifyNewOrder(orderId, sellerId, orderTotal) {
    return this.createNotification({
      recipientId: sellerId,
      type: "new_order",
      title: "New Order Received! 🛍️",
      message: `You have a new order worth $${orderTotal}`,
      data: { orderTotal },
      relatedEntity: { entityType: "Order", entityId: orderId },
      priority: "high",
    });
  }

  async notifyOrderShipped(orderId, buyerId) {
    return this.createNotification({
      recipientId: buyerId,
      type: "order_shipped",
      title: "Order Shipped! 📦",
      message: "Your order has been shipped and is on the way.",
      relatedEntity: { entityType: "Order", entityId: orderId },
      priority: "normal",
    });
  }

  // Welcome notification for new users
  async notifyWelcome(userId, userRole) {
    const messages = {
      buyer: "Welcome to Friends Gift! Start by browsing events or creating your own gift wishlist.",
      seller: "Welcome to Friends Gift! Complete your business profile to start selling.",
    };

    return this.createNotification({
      recipientId: userId,
      type: "welcome",
      title: "Welcome to Friends Gift! 🎁",
      message: messages[userRole] || "Welcome to Friends Gift!",
      priority: "normal",
    });
  }

  // Payment notifications
  async notifyPaymentReceived(userId, amount, paymentMethod) {
    return this.createNotification({
      recipientId: userId,
      type: "payment_received",
      title: "Payment Received ✅",
      message: `Payment of $${amount} via ${paymentMethod} was successful.`,
      data: { amount, paymentMethod },
      priority: "normal",
    });
  }

  async notifyPaymentFailed(userId, amount, reason) {
    return this.createNotification({
      recipientId: userId,
      type: "payment_failed",
      title: "Payment Failed ❌",
      message: `Payment of $${amount} failed. ${reason}`,
      data: { amount, reason },
      priority: "high",
    });
  }

  // Bulk notifications for multiple users
  async createBulkNotifications(notifications) {
    try {
      const results = await Promise.allSettled(
        notifications.map(notification => this.createNotification(notification))
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      return {
        success: true,
        summary: { successful, failed, total: notifications.length }
      };
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();