// backend/src/controllers/event/eventValidation.js
const Event = require('../../models/Event');
const mongoose = require('mongoose');

/**
 * Update event status
 * @route PUT /api/events/:id/status
 * @access Private (Owner only)
 */
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const allowedStatuses = ['pending', 'active', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: ' + allowedStatuses.join(', ')
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership or admin role
    if (event.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own events.'
      });
    }

    // Validate status transitions
    const currentStatus = event.status;
    const validTransitions = {
      'pending': ['active', 'cancelled'],
      'active': ['completed', 'cancelled'],
      'completed': [], // Cannot change from completed
      'cancelled': ['active'] // Can reactivate cancelled events
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${currentStatus}" to "${status}"`
      });
    }

    // Additional validation for specific status changes
    if (status === 'active' && event.currentAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event must have at least one contribution before becoming active'
      });
    }

    if (status === 'completed') {
      // Check if event has reached funding goal or end date
      const now = new Date();
      const endDate = new Date(event.endDate);
      const fundingPercentage = (event.currentAmount / event.targetAmount) * 100;

      if (now < endDate && fundingPercentage < 80) {
        return res.status(400).json({
          success: false,
          message: 'Event can only be completed if it has reached 80% funding or passed its end date'
        });
      }
    }

    // Update the status
    event.status = status;
    event.updatedAt = new Date();
    
    // Set completion date if status is completed
    if (status === 'completed') {
      event.completedAt = new Date();
    }

    await event.save();

    res.json({
      success: true,
      message: `Event status updated to "${status}"`,
      data: {
        id: event._id,
        status: event.status,
        updatedAt: event.updatedAt,
        completedAt: event.completedAt
      }
    });

  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate event for checkout eligibility
 * @param {Object} event - Event object
 * @returns {Object} Validation result
 */
const validateEventForCheckout = (event) => {
  const validation = {
    isEligible: false,
    reasons: [],
    currentAmount: event.currentAmount || 0,
    targetAmount: event.targetAmount,
    progress: 0,
    funding: 'insufficient',
    hasContributions: false,
    productsAvailable: true,
    unavailableProducts: [],
    sellers: 0
  };

  // Calculate progress
  if (event.targetAmount > 0) {
    validation.progress = (validation.currentAmount / validation.targetAmount) * 100;
  }

  // Check if event has contributions
  validation.hasContributions = validation.currentAmount > 0;
  if (!validation.hasContributions) {
    validation.reasons.push('Event must have at least one contribution');
  }

  // Check funding level
  if (validation.progress >= 100) {
    validation.funding = 'complete';
  } else if (validation.progress >= 80) {
    validation.funding = 'partial';
  } else {
    validation.funding = 'insufficient';
    
    // Check if event has passed end date
    const now = new Date();
    const endDate = new Date(event.endDate);
    
    if (now < endDate) {
      validation.reasons.push('Event must reach 80% funding or pass its end date to be eligible');
    }
  }

  // Check if event is active
  if (event.status !== 'active') {
    validation.reasons.push('Event must be active to proceed with checkout');
  }

  // Check product availability (this would need to be populated with actual product data)
  if (event.products && event.products.length > 0) {
    // Count unique sellers
    const sellers = new Set();
    event.products.forEach(item => {
      if (item.product && item.product.seller) {
        sellers.add(item.product.seller.toString());
      }
    });
    validation.sellers = sellers.size;

    // Check product stock (if populated)
    event.products.forEach(item => {
      if (item.product && item.product.stock !== undefined) {
        if (item.product.stock < item.quantity) {
          validation.productsAvailable = false;
          validation.unavailableProducts.push({
            name: item.product.name,
            requested: item.quantity,
            available: item.product.stock
          });
        }
      }
    });

    if (!validation.productsAvailable) {
      validation.reasons.push('Some products are no longer available in requested quantities');
    }
  } else {
    validation.reasons.push('Event must have products to checkout');
  }

  // Final eligibility check
  validation.isEligible = validation.reasons.length === 0 && 
                         validation.hasContributions && 
                         validation.productsAvailable &&
                         (validation.funding === 'complete' || validation.funding === 'partial' || new Date() >= new Date(event.endDate));

  return validation;
};

module.exports = {
  updateEventStatus,
  validateEventForCheckout
};