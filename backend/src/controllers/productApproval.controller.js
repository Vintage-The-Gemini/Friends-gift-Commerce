// backend/src/controllers/productApproval.controller.js
const Product = require("../models/Product");
const User = require("../models/user");
const { sendNotification } = require("../utils/notifications"); // Create this utility if needed

/**
 * Get all products pending approval
 * @route GET /api/admin/approvals/products
 * @access Private (Admin only)
 */
exports.getPendingProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Find products that are waiting for approval (add approvalStatus field to Product model)
    const query = { approvalStatus: "pending" };

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Add seller filter
    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    // Add category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Get products
    const products = await Product.find(query)
      .populate("seller", "name businessName email phoneNumber")
      .populate("category", "name")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
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
 * Get individual product for review
 * @route GET /api/admin/approvals/products/:id
 * @access Private (Admin only)
 */
exports.getProductForReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name businessName email phoneNumber")
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
    console.error("Error fetching product for review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
      error: error.message,
    });
  }
};

/**
 * Approve a product
 * @route PUT /api/admin/approvals/products/:id/approve
 * @access Private (Admin only)
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

    // Get margin percentage from request
    const marginPercentage = parseFloat(req.body.marginPercentage) || 0;
    
    // Calculate the selling price with margin
    let sellingPrice = product.price;
    if (marginPercentage > 0) {
      // Store original price as base price
      product.basePrice = product.price;
      
      // Calculate new price with margin
      const marginAmount = (product.price * marginPercentage) / 100;
      sellingPrice = product.price + marginAmount;
      
      // Update the product price to include margin
      product.price = sellingPrice;
      
      // Store the margin percentage for reference
      product.marginPercentage = marginPercentage;
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
 * @route PUT /api/admin/approvals/products/:id/reject
 * @access Private (Admin only)
 */
exports.rejectProduct = async (req, res) => {
  try {
    // Validate input
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
    product.isActive = false; // Deactivate the product

    await product.save();

    // Notify seller about rejection
    try {
      // Send notification to seller
      await sendNotification({
        userId: product.seller,
        title: "Product Rejected",
        message: `Your product "${product.name}" was not approved. Reason: ${req.body.reason}`,
        type: "product_rejection",
        referenceId: product._id,
      });

      // You could also implement email notifications here
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // Continue processing even if notification fails
    }

    res.json({
      success: true,
      message: "Product rejected successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error rejecting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject product",
      error: error.message,
    });
  }
};

/**
 * Get approval statistics
 * @route GET /api/admin/approvals/stats
 * @access Private (Admin only)
 */
exports.getApprovalStats = async (req, res) => {
  try {
    // Get product approval stats
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: "$approvalStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format stats into more readable object
    const stats = {
      products: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      },
    };

    // Process product stats
    productStats.forEach((stat) => {
      if (stat._id) {
        stats.products[stat._id] = stat.count;
      }
    });

    // Calculate total
    stats.products.total =
      stats.products.pending +
      stats.products.approved +
      stats.products.rejected;

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching approval stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approval statistics",
      error: error.message,
    });
  }
};

module.exports = exports;
