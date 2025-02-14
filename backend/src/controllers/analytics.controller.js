// src/controllers/analytics.controller.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @desc    Get seller dashboard overview stats
// @route   GET /api/seller/analytics/overview
// @access  Private/Seller
exports.getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });

    // Get active orders
    const activeOrders = await Order.countDocuments({
      seller: sellerId,
      status: { $in: ["pending", "processing"] },
    });

    // Calculate total sales and revenue
    const salesData = await Order.aggregate([
      {
        $match: {
          seller: sellerId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          seller: sellerId,
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ seller: sellerId })
      .sort("-createdAt")
      .limit(5)
      .populate("buyer", "name")
      .populate("products.product", "name price");

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          seller: sellerId,
          status: "completed",
        },
      },
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
          revenue: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Populate top products with product details
    await Product.populate(topProducts, { path: "_id", select: "name images" });

    res.json({
      success: true,
      data: {
        totalProducts,
        activeOrders,
        totalSales: salesData[0]?.totalSales || 0,
        totalRevenue: salesData[0]?.totalRevenue || 0,
        monthlyRevenue: monthlyData[0]?.monthlyRevenue || 0,
        recentOrders,
        topProducts: topProducts.map((item) => ({
          product: item._id,
          totalSold: item.totalSold,
          revenue: item.revenue,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
    });
  }
};

// @desc    Get seller sales analytics
// @route   GET /api/seller/analytics/sales
// @access  Private/Seller
exports.getSalesAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = "weekly" } = req.query;

    let dateField = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      weekly: { $week: "$createdAt" },
      monthly: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
    };

    const salesData = await Order.aggregate([
      {
        $match: {
          seller: sellerId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: dateField[period],
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales analytics",
    });
  }
};
