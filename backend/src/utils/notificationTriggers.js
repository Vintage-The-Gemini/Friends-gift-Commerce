// backend/src/utils/notificationTriggers.js
const notificationService = require("../services/notificationService");
const Event = require("../models/event");
const Product = require("../models/product");
const Order = require("../models/order");

/**
 * Integration points for triggering notifications throughout the application
 */

// ===== EVENT-RELATED NOTIFICATION TRIGGERS =====

// Trigger when someone contributes to an event
const triggerEventContribution = async (contributionData) => {
  try {
    const { eventId, contributorId, amount } = contributionData;
    
    // Get event details
    const event = await Event.findById(eventId).populate('creator');
    if (!event || !event.creator) return;

    // Don't notify if contributor is the event creator
    if (event.creator._id.toString() === contributorId.toString()) return;

    // Send notification to event creator
    await notificationService.notifyEventContribution(
      eventId,
      contributorId,
      event.creator._id,
      amount
    );

    // Check if target is reached
    if (event.currentAmount >= event.targetAmount) {
      await notificationService.notifyEventTargetReached(
        eventId,
        event.creator._id
      );
    }

    console.log(`Triggered contribution notification for event ${eventId}`);
  } catch (error) {
    console.error("Error triggering event contribution notification:", error);
  }
};

// Trigger when event is ending soon (called by cron job)
const triggerEventEndingSoon = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Find events ending in 1-3 days
    const endingEvents = await Event.find({
      status: "active",
      endDate: {
        $gte: oneDayFromNow,
        $lte: threeDaysFromNow,
      },
    }).populate('creator');

    for (const event of endingEvents) {
      if (!event.creator) continue;

      const daysLeft = Math.ceil(
        (new Date(event.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      await notificationService.notifyEventEndingSoon(
        event._id,
        event.creator._id,
        daysLeft
      );
    }

    console.log(`Triggered ending soon notifications for ${endingEvents.length} events`);
  } catch (error) {
    console.error("Error triggering event ending soon notifications:", error);
  }
};

// Trigger when event expires (called by cron job)
const triggerEventExpired = async () => {
  try {
    const now = new Date();

    // Find events that expired today
    const expiredEvents = await Event.find({
      status: "active",
      endDate: { $lt: now },
    }).populate('creator');

    for (const event of expiredEvents) {
      if (!event.creator) continue;

      // Update event status
      await Event.findByIdAndUpdate(event._id, { status: "expired" });

      // Send notification
      await notificationService.notifyEventExpired(
        event._id,
        event.creator._id
      );
    }

    console.log(`Triggered expired notifications for ${expiredEvents.length} events`);
  } catch (error) {
    console.error("Error triggering event expired notifications:", error);
  }
};

// ===== PRODUCT-RELATED NOTIFICATION TRIGGERS =====

// Trigger when product is approved/rejected (called from admin actions)
const triggerProductApproval = async (productId, status, reason = null) => {
  try {
    const product = await Product.findById(productId).populate('seller');
    if (!product || !product.seller) return;

    if (status === "approved") {
      await notificationService.notifyProductApproved(
        productId,
        product.seller._id
      );
    } else if (status === "rejected") {
      await notificationService.notifyProductRejected(
        productId,
        product.seller._id,
        reason || "Product does not meet our guidelines"
      );
    }

    console.log(`Triggered product ${status} notification for product ${productId}`);
  } catch (error) {
    console.error("Error triggering product approval notification:", error);
  }
};

// Trigger when new order is created
const triggerNewOrder = async (orderData) => {
  try {
    const { orderId, sellerId, totalAmount } = orderData;

    await notificationService.notifyNewOrder(
      orderId,
      sellerId,
      totalAmount
    );

    console.log(`Triggered new order notification for order ${orderId}`);
  } catch (error) {
    console.error("Error triggering new order notification:", error);
  }
};

// Trigger when order status changes
const triggerOrderStatusChange = async (orderId, newStatus, buyerId) => {
  try {
    if (newStatus === "shipped") {
      await notificationService.notifyOrderShipped(orderId, buyerId);
      console.log(`Triggered order shipped notification for order ${orderId}`);
    }
  } catch (error) {
    console.error("Error triggering order status change notification:", error);
  }
};

// ===== PAYMENT-RELATED NOTIFICATION TRIGGERS =====

// Trigger when payment is received
const triggerPaymentReceived = async (userId, amount, paymentMethod) => {
  try {
    await notificationService.notifyPaymentReceived(
      userId,
      amount,
      paymentMethod
    );

    console.log(`Triggered payment received notification for user ${userId}`);
  } catch (error) {
    console.error("Error triggering payment received notification:", error);
  }
};

// Trigger when payment fails
const triggerPaymentFailed = async (userId, amount, reason) => {
  try {
    await notificationService.notifyPaymentFailed(userId, amount, reason);

    console.log(`Triggered payment failed notification for user ${userId}`);
  } catch (error) {
    console.error("Error triggering payment failed notification:", error);
  }
};

// ===== USER ONBOARDING TRIGGERS =====

// Trigger welcome notification for new users
const triggerWelcomeNotification = async (userId, userRole) => {
  try {
    await notificationService.notifyWelcome(userId, userRole);
    console.log(`Triggered welcome notification for user ${userId}`);
  } catch (error) {
    console.error("Error triggering welcome notification:", error);
  }
};

// ===== BULK NOTIFICATION TRIGGERS =====

// Trigger notifications for multiple users (e.g., event updates)
const triggerBulkNotifications = async (notifications) => {
  try {
    const result = await notificationService.createBulkNotifications(notifications);
    console.log(`Triggered bulk notifications:`, result.summary);
    return result;
  } catch (error) {
    console.error("Error triggering bulk notifications:", error);
  }
};

// ===== SCHEDULED NOTIFICATION TRIGGERS =====

// Check for events ending soon (to be called by cron job)
const checkEventsEndingSoon = async () => {
  try {
    await triggerEventEndingSoon();
    console.log("Completed events ending soon check");
  } catch (error) {
    console.error("Error in events ending soon check:", error);
  }
};

// Check for expired events (to be called by cron job)
const checkExpiredEvents = async () => {
  try {
    await triggerEventExpired();
    console.log("Completed expired events check");
  } catch (error) {
    console.error("Error in expired events check:", error);
  }
};

// Check for low stock products (for sellers)
const checkLowStockProducts = async () => {
  try {
    const lowStockThreshold = 5; // Products with 5 or fewer items
    
    const lowStockProducts = await Product.find({
      stock: { $lte: lowStockThreshold, $gt: 0 },
      status: "approved",
    }).populate('seller');

    for (const product of lowStockProducts) {
      if (!product.seller) continue;

      await notificationService.createNotification({
        recipientId: product.seller._id,
        type: "product_out_of_stock",
        title: "Low Stock Alert ⚠️",
        message: `${product.name} is running low on stock (${product.stock} remaining)`,
        data: { productId: product._id, currentStock: product.stock },
        relatedEntity: { entityType: "Product", entityId: product._id },
        priority: "normal",
      });
    }

    console.log(`Triggered low stock notifications for ${lowStockProducts.length} products`);
  } catch (error) {
    console.error("Error checking low stock products:", error);
  }
};

module.exports = {
  // Event-related triggers
  triggerEventContribution,
  triggerEventEndingSoon,
  triggerEventExpired,
  
  // Product-related triggers
  triggerProductApproval,
  triggerNewOrder,
  triggerOrderStatusChange,
  
  // Payment-related triggers
  triggerPaymentReceived,
  triggerPaymentFailed,
  
  // User onboarding triggers
  triggerWelcomeNotification,
  
  // Bulk and scheduled triggers
  triggerBulkNotifications,
  checkEventsEndingSoon,
  checkExpiredEvents,
  checkLowStockProducts,
};