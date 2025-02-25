// src/controllers/order.controller.js
const Order = require("../models/Order");
const Event = require("../models/Event");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === "seller") {
      query.seller = req.user._id;
      console.log("Fetching orders for seller:", req.user._id);
    } else if (req.user.role === "buyer") {
      query.buyer = req.user._id;
    }

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Add date filters
    if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.createdAt = {
        ...query.createdAt,
        $lte: new Date(req.query.endDate),
      };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    console.log("Order query:", JSON.stringify(query));

    const orders = await Order.find(query)
      .populate("products.product", "name price images")
      .populate("seller", "name businessName")
      .populate("buyer", "name")
      .populate("event", "title eventType")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    console.log(`Found ${orders.length} orders for this query`);

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
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      description,
      trackingNumber,
      carrierName,
      estimatedDeliveryDate,
      shippingDetails,
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify seller authorization
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Update order status and progress
    order.status = status;
    order.orderProgress = status;

    // Add to timeline
    order.timeline.push({
      status,
      description: description || `Order status updated to ${status}`,
      timestamp: new Date(),
    });

    // Update shipping details
    if (shippingDetails) {
      order.shippingDetails = {
        ...order.shippingDetails,
        ...shippingDetails,
      };
    }

    // Update tracking information
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrierName) order.carrierName = carrierName;
    if (estimatedDeliveryDate)
      order.estimatedDeliveryDate = estimatedDeliveryDate;

    // If delivered, set actual delivery date
    if (status === "delivered") {
      order.actualDeliveryDate = new Date();
    }

    // Update all products status
    order.products.forEach((product) => {
      product.status = status;
    });

    await order.save();

    // Populate order details
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
