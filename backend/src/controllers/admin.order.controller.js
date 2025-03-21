// backend/src/controllers/admin.order.controller.js
const Order = require("../models/Order");
const User = require("../models/user");
const Event = require("../models/Event");
const Product = require("../models/Product");
const mongoose = require("mongoose");

/**
 * Get all orders with pagination and filters
 * @route GET /api/admin/orders
 * @access Admin only
 */
exports.getOrders = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    if (req.query.buyer) {
      query.buyer = req.query.buyer;
    }

    if (req.query.event) {
      query.event = req.query.event;
    }

    // Date range filters
    if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    }

    if (req.query.endDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(req.query.endDate);
      } else {
        query.createdAt = { $lte: new Date(req.query.endDate) };
      }
    }

    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");

      // Need to search through buyer and seller names
      const userMatches = await User.find({
        $or: [
          { name: searchRegex },
          { businessName: searchRegex },
          { phoneNumber: searchRegex },
        ],
      }).select("_id");

      const userIds = userMatches.map((user) => user._id);

      query.$or = [
        { _id: searchRegex.test(req.query.search) ? req.query.search : null },
        { buyer: { $in: userIds } },
        { seller: { $in: userIds } },
      ];
    }

    console.log("Admin orders query:", JSON.stringify(query));

    // Execute query with pagination
    const orders = await Order.find(query)
      .populate("buyer", "name phoneNumber")
      .populate("seller", "name businessName")
      .populate("event", "title eventType")
      .populate("products.product", "name price images")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

/**
 * Get single order with details
 * @route GET /api/admin/orders/:id
 * @access Admin only
 */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name phoneNumber email")
      .populate("seller", "name businessName phoneNumber email")
      .populate("event", "title eventType description")
      .populate({
        path: "products.product",
        select: "name price images description",
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

/**
 * Update order status
 * @route PUT /api/admin/orders/:id
 * @access Admin only
 */
exports.updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, carrierName, notes } =
      req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update fields if provided
    if (status) {
      order.status = status;
      order.orderProgress = status;

      // Add to timeline
      order.timeline.push({
        status,
        description: notes || `Order status updated to ${status} by admin`,
        timestamp: new Date(),
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (carrierName) {
      order.carrierName = carrierName;
    }

    // Update all products status if order is completed or cancelled
    if (status === "completed" || status === "cancelled") {
      order.products.forEach((product) => {
        product.status = status === "completed" ? "delivered" : "cancelled";
      });
    }

    await order.save();

    // Get the populated order to return
    const updatedOrder = await Order.findById(order._id)
      .populate("buyer", "name phoneNumber")
      .populate("seller", "name businessName")
      .populate("event", "title eventType")
      .populate("products.product", "name price images");

    res.json({
      success: true,
      message: `Order ${status ? "status updated" : "updated"} successfully`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

/**
 * Get order statistics
 * @route GET /api/admin/orders/stats
 * @access Admin only
 */
exports.getOrderStats = async (req, res) => {
  try {
    // Basic stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({
      status: "processing",
    });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Total revenue (from completed orders)
    const revenueData = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Monthly revenue chart data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly data
    const monthlyData = monthlyRevenue.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: item.revenue,
      count: item.count,
    }));

    // Top sellers
    const topSellers = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$seller",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      { $unwind: "$sellerInfo" },
      {
        $project: {
          sellerId: "$_id",
          sellerName: "$sellerInfo.name",
          businessName: "$sellerInfo.businessName",
          orderCount: 1,
          revenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        monthlyData,
        topSellers,
      },
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

/**
 * Export orders
 * @route GET /api/admin/orders/export
 * @access Admin only
 */
exports.exportOrders = async (req, res) => {
  try {
    // Build query from request filters
    const query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.startDate)
      query.createdAt = { $gte: new Date(req.query.startDate) };
    if (req.query.endDate) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(req.query.endDate);
    }

    // Get orders with minimal population
    const orders = await Order.find(query)
      .populate("buyer", "name phoneNumber")
      .populate("seller", "name businessName")
      .lean();

    // Format for export (simplified for example)
    const formattedOrders = orders.map((order) => ({
      orderId: order._id,
      buyerName: order.buyer?.name || "Unknown",
      sellerName: order.seller?.businessName || order.seller?.name || "Unknown",
      amount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.products.length,
    }));

    res.json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting orders",
      error: error.message,
    });
  }
};

module.exports = exports;
