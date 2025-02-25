// src/controllers/analytics.controller.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Get seller dashboard overview stats
// @route   GET /api/seller/analytics/overview
// @access  Private/Seller
exports.getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log("Fetching analytics for seller:", sellerId);

    // Get total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    console.log("Total products:", totalProducts);

    // Get active orders - ensure we're using the ObjectId format
    const sellerId_obj = new mongoose.Types.ObjectId(sellerId);
    const activeOrders = await Order.countDocuments({
      seller: sellerId_obj,
      status: { $in: ["pending", "processing"] },
    });
    console.log("Active orders:", activeOrders);

    // Calculate total sales and revenue - convert to ObjectId for aggregation
    const salesData = await Order.aggregate([
      {
        $match: {
          seller: sellerId_obj,
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
    console.log("Sales data:", salesData);

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          seller: sellerId_obj,
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
    console.log("Monthly data:", monthlyData);

    // Get recent orders, including those from events
    const recentOrders = await Order.find({ seller: sellerId_obj })
      .sort("-createdAt")
      .limit(5)
      .populate("buyer", "name")
      .populate("products.product", "name price")
      .populate("event", "title eventType");

    console.log(`Found ${recentOrders.length} recent orders`);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          seller: sellerId_obj,
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
    console.log(`Found ${topProducts.length} top products`);

    // Populate top products with product details
    await Product.populate(topProducts, { path: "_id", select: "name images" });

    const responseData = {
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
    };

    console.log("Sending dashboard data:", JSON.stringify(responseData));

    res.json({
      success: true,
      data: responseData,
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
    console.log(`Getting ${period} sales analytics for seller: ${sellerId}`);

    // Convert to ObjectId for MongoDB
    const sellerId_obj = new mongoose.Types.ObjectId(sellerId);

    let dateField = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      weekly: { $week: "$createdAt" },
      monthly: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
    };

    const salesData = await Order.aggregate([
      {
        $match: {
          seller: sellerId_obj,
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

    console.log(`Found ${salesData.length} ${period} data points`);

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
