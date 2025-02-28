// backend/src/controllers/analytics.controller.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get total products count
    let totalProducts = 0;
    try {
      totalProducts = await Product.countDocuments({
        seller: sellerId,
        isActive: true,
      });
    } catch (err) {
      console.error("Error counting products:", err);
    }

    // Get active orders count
    let activeOrders = 0;
    try {
      activeOrders = await Order.countDocuments({
        seller: sellerId,
        status: { $in: ["pending", "processing"] },
      });
    } catch (err) {
      console.error("Error counting active orders:", err);
    }

    // Get total sales count
    let totalSales = 0;
    try {
      totalSales = await Order.countDocuments({
        seller: sellerId,
        status: "completed",
      });
    } catch (err) {
      console.error("Error counting total sales:", err);
    }

    // Get monthly revenue
    let monthlyRevenue = 0;
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const revenueData = await Order.aggregate([
        {
          $match: {
            seller: mongoose.Types.ObjectId(sellerId),
            status: "completed",
            createdAt: { $gte: firstDayOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]);

      monthlyRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    } catch (err) {
      console.error("Error calculating monthly revenue:", err);
    }

    // Get recent orders
    let recentOrders = [];
    try {
      recentOrders = await Order.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("buyer", "name")
        .lean();
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }

    // Get top products
    let topProducts = [];
    try {
      topProducts = await Order.aggregate([
        {
          $match: {
            seller: mongoose.Types.ObjectId(sellerId),
            status: "completed",
          },
        },
        { $unwind: "$products" },
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
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]);
    } catch (err) {
      console.error("Error aggregating top products:", err);
    }

    res.json({
      success: true,
      data: {
        totalProducts,
        activeOrders,
        totalSales,
        totalRevenue: monthlyRevenue, // Same as monthly for now
        monthlyRevenue,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
      error: error.message,
    });
  }
};

// Add missing methods
exports.getSalesAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = "weekly" } = req.query;

    // Return dummy data for now
    res.json({
      success: true,
      data: [
        { _id: "2023-01", revenue: 1200, sales: 10 },
        { _id: "2023-02", revenue: 1500, sales: 12 },
        { _id: "2023-03", revenue: 1800, sales: 15 },
      ],
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales analytics",
      error: error.message,
    });
  }
};

exports.getProductPerformance = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Return dummy data for now
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Product performance error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product performance",
      error: error.message,
    });
  }
};

exports.getCustomerInsights = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Return dummy data for now
    res.json({
      success: true,
      data: {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        averageOrderValue: 0,
      },
    });
  } catch (error) {
    console.error("Customer insights error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer insights",
      error: error.message,
    });
  }
};
