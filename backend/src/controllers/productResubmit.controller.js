// backend/src/controllers/productResubmit.controller.js
const Product = require("../models/Product");
const { sendNotification } = require("../utils/notifications");

/**
 * Resubmit a rejected product without changes
 * @route POST /api/seller/products/:id/resubmit
 * @access Private (Seller only)
 */
exports.resubmitProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to resubmit this product",
      });
    }

    // Check if product is rejected and can be resubmitted
    if (product.approvalStatus !== "rejected") {
      return res.status(400).json({
        success: false,
        message: "Only rejected products can be resubmitted",
      });
    }

    // Store rejection in history
    product.previousVersions.push({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      characteristics: product.characteristics,
      rejectionReason: product.reviewNotes,
      rejectedAt: product.reviewedAt,
      rejectedBy: product.reviewedBy,
    });

    // Reset approval status
    product.approvalStatus = "pending";
    product.reviewedBy = undefined;
    product.reviewedAt = undefined;
    product.reviewNotes = undefined;

    // Update resubmission metadata
    product.resubmitted = true;
    product.resubmissionCount += 1;

    await product.save();

    // Notify admins about resubmission
    // (In a real app, you would implement this notification)

    res.json({
      success: true,
      message: "Product resubmitted for approval",
      data: product,
    });
  } catch (error) {
    console.error("Product resubmission error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resubmit product",
    });
  }
};

/**
 * Get product rejection history
 * @route GET /api/seller/products/:id/history
 * @access Private (Seller only)
 */
exports.getProductHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this product's history",
      });
    }

    // Return previous versions
    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          approvalStatus: product.approvalStatus,
          resubmitted: product.resubmitted,
          resubmissionCount: product.resubmissionCount,
          reviewNotes: product.reviewNotes,
          reviewedAt: product.reviewedAt,
        },
        previousVersions: product.previousVersions || [],
      },
    });
  } catch (error) {
    console.error("Error fetching product history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product history",
    });
  }
};

/**
 * Get product approval status statistics
 * @route GET /api/seller/products/stats/approval
 * @access Private (Seller only)
 */
exports.getProductStatusStats = async (req, res) => {
  try {
    // Get counts of products by approval status for this seller
    const stats = await Product.aggregate([
      // Match only products owned by this seller
      { $match: { seller: req.user._id } },
      // Group by approval status
      {
        $group: {
          _id: "$approvalStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format stats into more readable object
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

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching product status stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product statistics",
    });
  }
};

module.exports = exports;
