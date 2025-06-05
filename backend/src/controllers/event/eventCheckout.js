// backend/src/controllers/event/eventCheckout.js
const Event = require('../../models/Event');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { validateEventForCheckout } = require('./eventValidation');
const mongoose = require('mongoose');

/**
 * Get event checkout eligibility
 * @route GET /api/events/:id/checkout/eligibility
 * @access Private (Owner only)
 */
const getEventCheckoutEligibility = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id)
      .populate('products.product', 'name price stock seller')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the event creator can check checkout eligibility.'
      });
    }

    // Validate event for checkout
    const validation = validateEventForCheckout(event);

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Get checkout eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check checkout eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Complete event checkout and create orders
 * @route POST /api/events/:id/checkout
 * @access Private (Owner only)
 */
const completeEventCheckout = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const { id } = req.params;
    const { shippingDetails, paymentMethod = 'already_paid' } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    // Validate shipping details
    if (!shippingDetails || !shippingDetails.name || !shippingDetails.address || !shippingDetails.phone) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Complete shipping details are required (name, address, phone)'
      });
    }

    const event = await Event.findById(id)
      .populate('products.product', 'name price stock seller images')
      .session(session);

    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the event creator can checkout the event.'
      });
    }

    // Check if already completed
    if (event.status === 'completed') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'This event has already been checked out'
      });
    }

    // Validate checkout eligibility
    const validation = validateEventForCheckout(event);
    if (!validation.isEligible) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Event is not eligible for checkout',
        reasons: validation.reasons,
        details: validation
      });
    }

    // Group products by seller
    const productsBySeller = {};
    event.products.forEach(item => {
      const sellerId = item.product.seller.toString();
      if (!productsBySeller[sellerId]) {
        productsBySeller[sellerId] = [];
      }
      productsBySeller[sellerId].push(item);
    });

    const createdOrders = [];
    let totalOrderAmount = 0;

    // Create orders for each seller
    for (const sellerId of Object.keys(productsBySeller)) {
      const sellerProducts = productsBySeller[sellerId];
      
      // Calculate order total for this seller
      const orderTotal = sellerProducts.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      totalOrderAmount += orderTotal;

      // Create order
      const order = new Order({
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        buyer: event.creator,
        seller: sellerId,
        products: sellerProducts.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity
        })),
        totalAmount: orderTotal,
        shippingAddress: {
          name: shippingDetails.name,
          address: shippingDetails.address,
          city: shippingDetails.city || '',
          state: shippingDetails.state || '',
          postalCode: shippingDetails.postalCode || '',
          country: shippingDetails.country || 'Kenya',
          phone: shippingDetails.phone,
          notes: shippingDetails.notes || ''
        },
        paymentMethod,
        paymentStatus: 'completed', // Since event funds were already collected
        orderStatus: 'confirmed',
        source: 'event',
        sourceEventId: event._id,
        notes: `Order created from event: ${event.title}`
      });

      await order.save({ session });
      createdOrders.push(order._id);

      // Update product stock
      for (const item of sellerProducts) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    }

    // Update event status to completed
    event.status = 'completed';
    event.completedAt = new Date();
    event.orders = createdOrders;
    event.shippingDetails = shippingDetails;
    
    await event.save({ session });

    await session.commitTransaction();

    // Populate orders for response
    const populatedOrders = await Order.find({ _id: { $in: createdOrders } })
      .populate('seller', 'businessName email')
      .populate('products.product', 'name images');

    res.json({
      success: true,
      message: 'Event checkout completed successfully',
      data: {
        event: {
          id: event._id,
          title: event.title,
          status: event.status,
          completedAt: event.completedAt
        },
        orders: populatedOrders,
        summary: {
          totalOrders: createdOrders.length,
          totalAmount: totalOrderAmount,
          uniqueSellers: Object.keys(productsBySeller).length
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Complete checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete checkout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getEventCheckoutEligibility,
  completeEventCheckout
};