// backend/src/controllers/analytics.controller.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

/**
 * @desc    Get seller dashboard overview stats
 * @route   GET /api/seller/analytics/overview
 * @access  Private/Seller
 */
exports.getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log("Fetching analytics for seller:", sellerId);

    // Convert string ID to MongoDB ObjectId if necessary
    const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;

    // Get total products
    const totalProducts = await Product.countDocuments({
      seller: sellerObjectId,
    });
    console.log("Total products:", totalProducts);

    // Get active orders
    const activeOrders = await Order.countDocuments({
      seller: sellerObjectId,
      status: { $in: ["pending", "processing"] },
    });
    console.log("Active orders:", activeOrders);

    // Calculate total sales and revenue
    const salesData = await Order.aggregate([
      {
        $match: {
          seller: sellerObjectId,
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
          seller: sellerObjectId,
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

    // Get recent orders
    const recentOrders = await Order.find({ seller: sellerObjectId })
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
          seller: sellerObjectId,
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
        $sort: { revenue: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    console.log(`Found ${topProducts.length} top products`);

    // Populate top products with product details
    const populatedTopProducts = await Product.populate(topProducts, {
      path: "_id",
      select: "name images",
    });

    // Format the data for response
    const responseData = {
      totalProducts,
      activeOrders,
      totalSales: salesData[0]?.totalSales || 0,
      totalRevenue: salesData[0]?.totalRevenue || 0,
      monthlyRevenue: monthlyData[0]?.monthlyRevenue || 0,
      recentOrders,
      topProducts: populatedTopProducts.map((item) => ({
        product: item._id,
        totalSold: item.totalSold,
        revenue: item.revenue,
      })),
    };

    res.json({
      success: true,
      data: responseData,
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

/**
 * @desc    Get seller sales analytics
 * @route   GET /api/seller/analytics/sales
 * @access  Private/Seller
 */
exports.getSalesAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = "weekly" } = req.query;
    console.log(`Getting ${period} sales analytics for seller: ${sellerId}`);

    // Convert string ID to MongoDB ObjectId if necessary
    const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;

    // Define date grouping based on period
    let dateGroup;
    let dateMatch = {};
    const now = new Date();

    switch (period) {
      case "daily":
        // Last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        dateGroup = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        dateMatch = { createdAt: { $gte: thirtyDaysAgo } };
        break;
      case "weekly":
        // Last 12 weeks
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(now.getDate() - 84); // 12 weeks * 7 days
        dateGroup = {
          $week: {
            $dateFromString: {
              dateString: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
        };
        dateMatch = { createdAt: { $gte: twelveWeeksAgo } };
        break;
      case "monthly":
        // Last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        dateGroup = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateMatch = { createdAt: { $gte: twelveMonthsAgo } };
        break;
      default:
        dateGroup = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        dateMatch = {};
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          seller: sellerObjectId,
          status: "completed",
          ...dateMatch,
        },
      },
      {
        $group: {
          _id: dateGroup,
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
      error: error.message,
    });
  }
};

/**
 * @desc    Get product performance analytics
 * @route   GET /api/seller/analytics/products
 * @access  Private/Seller
 */
exports.getProductPerformance = async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log(
      `Getting product performance analytics for seller: ${sellerId}`
    );

    // Convert string ID to MongoDB ObjectId if necessary
    const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;

    // Get all products with sales and performance metrics
    const productPerformance = await Product.aggregate([
      {
        $match: { seller: sellerObjectId },
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$seller", sellerObjectId] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
              },
            },
            { $unwind: "$products" },
            {
              $match: {
                $expr: { $eq: ["$products.product", "$$productId"] },
              },
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$products.quantity" },
                totalRevenue: {
                  $sum: {
                    $multiply: ["$products.price", "$products.quantity"],
                  },
                },
                orders: { $addToSet: "$_id" },
              },
            },
          ],
          as: "salesData",
        },
      },
      {
        $addFields: {
          sales: {
            $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0],
          },
          revenue: {
            $ifNull: [{ $arrayElemAt: ["$salesData.totalRevenue", 0] }, 0],
          },
          orderCount: {
            $size: {
              $ifNull: [{ $arrayElemAt: ["$salesData.orders", 0] }, []],
            },
          },
          inStock: { $gt: ["$stock", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          stock: 1,
          category: 1,
          images: { $slice: ["$images", 1] },
          sales: 1,
          revenue: 1,
          orderCount: 1,
          inStock: 1,
          salesData: 0,
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    // Get category information for each product
    const populatedProducts = await Product.populate(productPerformance, {
      path: "category",
      select: "name",
    });

    res.json({
      success: true,
      count: populatedProducts.length,
      data: populatedProducts,
    });
  } catch (error) {
    console.error("Product performance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product performance analytics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get customer insights
 * @route   GET /api/seller/analytics/customers
 * @access  Private/Seller
 */
exports.getCustomerInsights = async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log(`Getting customer insights for seller: ${sellerId}`);

    // Convert string ID to MongoDB ObjectId if necessary
    const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;

    // Get customer purchase data
    const customerData = await Order.aggregate([
      {
        $match: {
          seller: sellerObjectId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$buyer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          firstPurchase: { $min: "$createdAt" },
          lastPurchase: { $max: "$createdAt" },
          products: { $addToSet: "$products.product" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $addFields: {
          customerName: { $arrayElemAt: ["$customerInfo.name", 0] },
          phoneNumber: { $arrayElemAt: ["$customerInfo.phoneNumber", 0] },
          daysSinceLastPurchase: {
            $dateDiff: {
              startDate: "$lastPurchase",
              endDate: "$$NOW",
              unit: "day",
            },
          },
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          _id: 1,
          customerName: 1,
          phoneNumber: 1,
          totalOrders: 1,
          totalSpent: 1,
          firstPurchase: 1,
          lastPurchase: 1,
          daysSinceLastPurchase: 1,
          productCount: 1,
          customerInfo: 0,
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ]);

    // Calculate overall statistics
    const totalCustomers = customerData.length;
    const totalRevenue = customerData.reduce(
      (sum, customer) => sum + customer.totalSpent,
      0
    );
    const averageOrderValue =
      totalRevenue /
      customerData.reduce((sum, customer) => sum + customer.totalOrders, 0);

    const repeatCustomers = customerData.filter(
      (customer) => customer.totalOrders > 1
    ).length;
    const repeatRate =
      totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalRevenue,
        averageOrderValue,
        repeatCustomers,
        repeatRate,
      },
      customers: customerData,
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
