// backend/src/controllers/admin.product.controller.js
const Product = require("../models/Product");
const User = require("../models/user");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * Get all products with pagination and filters
 * @route GET /api/admin/products
 * @access Admin only
 */
exports.getProducts = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (typeof req.query.isActive !== "undefined") {
      query.isActive = req.query.isActive === "true";
    }

    if (req.query.approvalStatus) {
      query.approvalStatus = req.query.approvalStatus;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.minPrice) {
      query.price = { $gte: parseFloat(req.query.minPrice) };
    }

    if (req.query.maxPrice) {
      if (query.price) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      } else {
        query.price = { $lte: parseFloat(req.query.maxPrice) };
      }
    }

    console.log("Admin products query:", JSON.stringify(query));

    // Execute query with pagination
    const products = await Product.find(query)
      .populate("seller", "name businessName")
      .populate("category", "name")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: products,
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

/**
 * Get products pending approval
 * @route GET /api/admin/products/pending
 * @access Admin only
 */
exports.getPendingProducts = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query with pending approval status
    const query = { approvalStatus: "pending" };

    // Add seller filter if provided
    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Add search filter if provided
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    console.log("Pending products query:", JSON.stringify(query));

    // Execute query
    const products = await Product.find(query)
      .populate("seller", "name businessName phoneNumber email")
      .populate("category", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: products,
    });
  } catch (error) {
    console.error("Error fetching pending products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending products",
      error: error.message,
    });
  }
};

/**
 * Get a single product for admin review
 * @route GET /api/admin/products/:id
 * @access Admin only
 */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name businessName phoneNumber email")
      .populate("category", "name characteristics");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product details",
      error: error.message,
    });
  }
};

/**
 * Approve a product
 * @route PUT /api/admin/products/:id/approve
 * @access Admin only
 */
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update product status
    product.approvalStatus = "approved";
    product.reviewedBy = req.user._id;
    product.reviewedAt = Date.now();
    product.reviewNotes = req.body.notes || "Product approved";
    product.isActive = true; // Activate the product when approved

    await product.save();

    // Send notification to seller (implementation depends on your notification system)
    // For example: notificationService.notifySeller(product.seller, 'product_approved', product._id);

    res.json({
      success: true,
      message: "Product approved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error approving product:", error);
    res.status(500).json({
      success: false,
      message: "Error approving product",
      error: error.message,
    });
  }
};

/**
 * Reject a product
 * @route PUT /api/admin/products/:id/reject
 * @access Admin only
 */
exports.rejectProduct = async (req, res) => {
  try {
    // Validate rejection reason
    if (!req.body.reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update product status
    product.approvalStatus = "rejected";
    product.reviewedBy = req.user._id;
    product.reviewedAt = Date.now();
    product.reviewNotes = req.body.reason;
    product.isActive = false; // Deactivate the product when rejected

    await product.save();

    // Send notification to seller (implementation depends on your notification system)
    // For example: notificationService.notifySeller(product.seller, 'product_rejected', product._id, req.body.reason);

    res.json({
      success: true,
      message: "Product rejected successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error rejecting product:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting product",
      error: error.message,
    });
  }
};

/**
 * Get approval statistics
 * @route GET /api/admin/products/approval-stats
 * @access Admin only
 */
exports.getApprovalStats = async (req, res) => {
  try {
    // Get totals by approval status
    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$approvalStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format into more readable object
    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    };

    // Fill in the stats
    stats.forEach((stat) => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
      }
    });

    // Calculate total
    formattedStats.total =
      formattedStats.pending +
      formattedStats.approved +
      formattedStats.rejected;

    // Get counts by seller (top 5)
    const sellerStats = await Product.aggregate([
      {
        $group: {
          _id: "$seller",
          count: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$approvalStatus", "pending"] }, 1, 0],
            },
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$approvalStatus", "approved"] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$approvalStatus", "rejected"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
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
          _id: 1,
          sellerName: "$sellerInfo.name",
          businessName: "$sellerInfo.businessName",
          count: 1,
          pending: 1,
          approved: 1,
          rejected: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        products: formattedStats,
        topSellers: sellerStats,
      },
    });
  } catch (error) {
    console.error("Error getting approval stats:", error);
    res.status(500).json({
      success: false,
      message: "Error getting approval statistics",
      error: error.message,
    });
  }
};

module.exports = exports;
