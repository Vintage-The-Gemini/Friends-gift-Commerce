// backend/src/utils/notificationTriggers.js - MINIMAL VERSION TO PREVENT CRASHES
console.log("🔔 Loading notification triggers...");

/**
 * Minimal notification triggers to prevent app crashes
 * This is a basic implementation that logs notifications instead of creating them
 * Replace with full implementation once notification system is ready
 */

// For now, just log notifications instead of creating them
const logNotification = (type, data) => {
  console.log(`📢 [NOTIFICATION] ${type}:`, JSON.stringify(data, null, 2));
};

/**
 * Trigger welcome notification for new users
 */
const triggerWelcomeNotification = async (userId, userRole = "buyer") => {
  try {
    logNotification('WELCOME', {
      userId,
      userRole,
      message: `Welcome notification for ${userRole} user ${userId}`
    });
    return { success: true, message: 'Welcome notification logged' };
  } catch (error) {
    console.error("Error in triggerWelcomeNotification:", error);
  }
};

/**
 * Trigger notification when someone contributes to an event
 */
const triggerEventContribution = async ({ eventId, contributorId, amount, message }) => {
  try {
    logNotification('EVENT_CONTRIBUTION', {
      eventId,
      contributorId,
      amount,
      message,
      description: `Contribution of $${amount} received for event ${eventId}`
    });
    return { success: true, message: 'Event contribution notification logged' };
  } catch (error) {
    console.error("Error in triggerEventContribution:", error);
  }
};

/**
 * Trigger notification when event target is reached
 */
const triggerEventTargetReached = async (eventId) => {
  try {
    logNotification('EVENT_TARGET_REACHED', {
      eventId,
      description: `Event ${eventId} has reached its target amount`
    });
    return { success: true, message: 'Event target reached notification logged' };
  } catch (error) {
    console.error("Error in triggerEventTargetReached:", error);
  }
};

/**
 * Trigger notification when event is ending soon
 */
const triggerEventEndingSoon = async (eventId, daysLeft = 3) => {
  try {
    logNotification('EVENT_ENDING_SOON', {
      eventId,
      daysLeft,
      description: `Event ${eventId} is ending in ${daysLeft} days`
    });
    return { success: true, message: 'Event ending soon notification logged' };
  } catch (error) {
    console.error("Error in triggerEventEndingSoon:", error);
  }
};

/**
 * Trigger notification when event checkout is ready
 */
const triggerEventCheckoutReady = async (eventId) => {
  try {
    logNotification('EVENT_CHECKOUT_READY', {
      eventId,
      description: `Event ${eventId} is ready for checkout`
    });
    return { success: true, message: 'Event checkout ready notification logged' };
  } catch (error) {
    console.error("Error in triggerEventCheckoutReady:", error);
  }
};

/**
 * Trigger notification when event is completed
 */
const triggerEventCompleted = async (eventId) => {
  try {
    logNotification('EVENT_COMPLETED', {
      eventId,
      description: `Event ${eventId} has been completed`
    });
    return { success: true, message: 'Event completed notification logged' };
  } catch (error) {
    console.error("Error in triggerEventCompleted:", error);
  }
};

/**
 * Trigger notification for product approval/rejection
 */
const triggerProductApproval = async (productId, status, reason = null, reviewerId = null) => {
  try {
    logNotification('PRODUCT_APPROVAL', {
      productId,
      status,
      reason,
      reviewerId,
      description: `Product ${productId} was ${status}`
    });
    return { success: true, message: 'Product approval notification logged' };
  } catch (error) {
    console.error("Error in triggerProductApproval:", error);
  }
};

/**
 * Trigger notification when product is out of stock
 */
const triggerProductOutOfStock = async (productId) => {
  try {
    logNotification('PRODUCT_OUT_OF_STOCK', {
      productId,
      description: `Product ${productId} is out of stock`
    });
    return { success: true, message: 'Product out of stock notification logged' };
  } catch (error) {
    console.error("Error in triggerProductOutOfStock:", error);
  }
};

/**
 * Trigger notification for new order
 */
const triggerNewOrder = async (orderId) => {
  try {
    logNotification('NEW_ORDER', {
      orderId,
      description: `New order ${orderId} received`
    });
    return { success: true, message: 'New order notification logged' };
  } catch (error) {
    console.error("Error in triggerNewOrder:", error);
  }
};

/**
 * Trigger notification for order status update
 */
const triggerOrderUpdate = async (orderId, newStatus, message = null) => {
  try {
    logNotification('ORDER_UPDATE', {
      orderId,
      newStatus,
      message,
      description: `Order ${orderId} status updated to ${newStatus}`
    });
    return { success: true, message: 'Order update notification logged' };
  } catch (error) {
    console.error("Error in triggerOrderUpdate:", error);
  }
};

/**
 * Trigger notification for successful payment
 */
const triggerPaymentReceived = async (contributionId) => {
  try {
    logNotification('PAYMENT_RECEIVED', {
      contributionId,
      description: `Payment received for contribution ${contributionId}`
    });
    return { success: true, message: 'Payment received notification logged' };
  } catch (error) {
    console.error("Error in triggerPaymentReceived:", error);
  }
};

/**
 * Trigger notification for failed payment
 */
const triggerPaymentFailed = async (contributionId, reason = null) => {
  try {
    logNotification('PAYMENT_FAILED', {
      contributionId,
      reason,
      description: `Payment failed for contribution ${contributionId}`
    });
    return { success: true, message: 'Payment failed notification logged' };
  } catch (error) {
    console.error("Error in triggerPaymentFailed:", error);
  }
};

/**
 * Trigger notification for event invitation
 */
const triggerEventInvitation = async (eventId, invitedUserId, inviterName) => {
  try {
    logNotification('EVENT_INVITATION', {
      eventId,
      invitedUserId,
      inviterName,
      description: `User ${invitedUserId} invited to event ${eventId} by ${inviterName}`
    });
    return { success: true, message: 'Event invitation notification logged' };
  } catch (error) {
    console.error("Error in triggerEventInvitation:", error);
  }
};

/**
 * Trigger reminder notification
 */
const triggerReminder = async (userId, type, title, message, relatedEntity = null, priority = "normal") => {
  try {
    logNotification('REMINDER', {
      userId,
      type,
      title,
      message,
      relatedEntity,
      priority,
      description: `Reminder for user ${userId}: ${title}`
    });
    return { success: true, message: 'Reminder notification logged' };
  } catch (error) {
    console.error("Error in triggerReminder:", error);
  }
};

/**
 * Send notification to multiple users
 */
const triggerBulkNotification = async (userIds, notificationData) => {
  try {
    logNotification('BULK_NOTIFICATION', {
      userIds,
      notificationData,
      description: `Bulk notification sent to ${userIds.length} users`
    });
    return { success: true, message: 'Bulk notification logged' };
  } catch (error) {
    console.error("Error in triggerBulkNotification:", error);
  }
};

console.log("✅ Notification triggers loaded (minimal logging version)");

// Export all functions
module.exports = {
  // User related
  triggerWelcomeNotification,
  
  // Event related
  triggerEventContribution,
  triggerEventTargetReached,
  triggerEventEndingSoon,
  triggerEventCheckoutReady,
  triggerEventCompleted,
  
  // Product related
  triggerProductApproval,
  triggerProductOutOfStock,
  
  // Order related
  triggerNewOrder,
  triggerOrderUpdate,
  
  // Payment related
  triggerPaymentReceived,
  triggerPaymentFailed,
  
  // Invitation related
  triggerEventInvitation,
  
  // General
  triggerReminder,
  triggerBulkNotification
};