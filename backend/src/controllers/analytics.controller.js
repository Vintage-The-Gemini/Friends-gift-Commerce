// backend/src/controllers/analytics.controller.js
exports.getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get total products count
    const totalProducts = await Product.countDocuments({
      seller: sellerId,
      isActive: true,
    });

    // Get active orders count
    const activeOrders = await Order.countDocuments({
      seller: sellerId,
      status: { $in: ["pending", "processing"] },
    });

    // Get total sales count
    const totalSales = await Order.countDocuments({
      seller: sellerId,
      status: "completed",
    });

    // Get monthly revenue
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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

    const monthlyRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent orders
    const recentOrders = await Order.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("buyer", "name")
      .lean();

    // Get top products
    const topProducts = await Order.aggregate([
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
