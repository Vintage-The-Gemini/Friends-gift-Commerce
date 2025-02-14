// controllers/order.controller.js
const Order = require("../models/Order");
const Event = require("../models/Event");
const Product = require("../models/Product");

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { eventId, products, shippingAddress } = req.body;

    // Validate event exists
    const event = await Event.findById(eventId).populate("products.product");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      // Validate stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;
      orderProducts.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order
    const order = await Order.create({
      event: eventId,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      seller: products[0].sellerId, // Assuming all products are from same seller
      buyer: req.user._id,
    });

    // Update event with order reference
    event.order = order._id;
    await event.save();

    // Populate order details
    await order.populate([
      { path: "products.product", select: "name price images" },
      { path: "seller", select: "name businessName" },
      { path: "buyer", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders (filtered by role)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === "seller") {
      query.seller = req.user._id;
    } else if (req.user.role === "buyer") {
      query.buyer = req.user._id;
    }

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("products.product", "name price images")
      .populate("seller", "name businessName")
      .populate("buyer", "name")
      .populate("event", "title eventType")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product", "name price images description")
      .populate("seller", "name businessName")
      .populate("buyer", "name")
      .populate("event", "title eventType description");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (
      order.buyer.toString() !== req.user._id.toString() &&
      order.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (
      order.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Update order fields
    const { status, trackingNumber, estimatedDeliveryDate } = req.body;

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate)
      order.estimatedDeliveryDate = estimatedDeliveryDate;

    // Update product statuses if needed
    if (status === "completed") {
      order.products.forEach((product) => {
        product.status = "delivered";
      });
    }

    await order.save();

    // Populate updated order
    await order.populate([
      { path: "products.product", select: "name price images" },
      { path: "seller", select: "name businessName" },
      { path: "buyer", select: "name" },
      { path: "event", select: "title eventType" },
    ]);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (
      order.buyer.toString() !== req.user._id.toString() &&
      order.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Only allow cancellation if order is pending or processing
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
