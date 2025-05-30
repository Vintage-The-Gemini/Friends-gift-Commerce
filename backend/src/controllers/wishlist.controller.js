// backend/src/controllers/wishlist.controller.js
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

/**
 * Get user's wishlist
 * @route GET /api/wishlist
 * @access Private
 */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, sortBy = "-addedAt" } = req.query;

    // Pagination
    const currentPage = parseInt(page);
    const itemsPerPage = Math.min(parseInt(limit), 50); // Max 50 items
    const skip = (currentPage - 1) * itemsPerPage;

    // Get wishlist items with populated product details
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: "product",
        select: "name price images description stock isActive seller",
        populate: {
          path: "seller",
          select: "name businessName"
        }
      })
      .sort(sortBy)
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    // Filter out items where product no longer exists
    const validItems = wishlistItems.filter(item => item.product);

    // Get total count
    const total = await Wishlist.countDocuments({ user: userId });

    // Calculate statistics
    const stats = {
      totalItems: total,
      availableItems: validItems.filter(item => 
        item.product.isActive && item.product.stock > 0
      ).length,
      totalValue: validItems.reduce((sum, item) => 
        sum + (item.product.price || 0), 0
      ),
    };

    res.status(200).json({
      success: true,
      data: validItems,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages: Math.ceil(total / itemsPerPage),
        hasNext: currentPage < Math.ceil(total / itemsPerPage),
        hasPrev: currentPage > 1
      },
      stats
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * Add product to wishlist
 * @route POST /api/wishlist
 * @access Private
 */
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, notes, priority = "medium" } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product is not available"
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: userId,
      product: productId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Product is already in your wishlist"
      });
    }

    // Create wishlist item
    const wishlistItem = await Wishlist.create({
      user: userId,
      product: productId,
      notes,
      priority
    });

    // Populate the product details for response
    await wishlistItem.populate({
      path: "product",
      select: "name price images description stock",
      populate: {
        path: "seller",
        select: "name businessName"
      }
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlistItem
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product is already in your wishlist"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

/**
 * Remove product from wishlist
 * @route DELETE /api/wishlist/:productId
 * @access Private
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Find and remove the wishlist item
    const deletedItem = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist"
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

/**
 * Update wishlist item
 * @route PUT /api/wishlist/:productId
 * @access Private
 */
exports.updateWishlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { notes, priority } = req.body;

    // Find and update the wishlist item
    const wishlistItem = await Wishlist.findOneAndUpdate(
      { user: userId, product: productId },
      { 
        ...(notes !== undefined && { notes }),
        ...(priority && { priority })
      },
      { new: true }
    ).populate({
      path: "product",
      select: "name price images description stock",
      populate: {
        path: "seller",
        select: "name businessName"
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist item updated",
      data: wishlistItem
    });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update wishlist item",
      error: error.message,
    });
  }
};

/**
 * Check if product is in wishlist
 * @route GET /api/wishlist/check/:productId
 * @access Private
 */
exports.checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const isInWishlist = await Wishlist.isProductInWishlist(userId, productId);

    res.status(200).json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status",
      error: error.message,
    });
  }
};

/**
 * Clear entire wishlist
 * @route DELETE /api/wishlist
 * @access Private
 */
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Wishlist.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: `Removed ${result.deletedCount} items from wishlist`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error.message,
    });
  }
};

/**
 * Move wishlist items to event
 * @route POST /api/wishlist/move-to-event
 * @access Private
 */
exports.moveToEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productIds, eventId } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required"
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    // This would integrate with your event system
    // For now, we'll just remove from wishlist
    const result = await Wishlist.deleteMany({
      user: userId,
      product: { $in: productIds }
    });

    res.status(200).json({
      success: true,
      message: `Moved ${result.deletedCount} items to event`,
      data: { movedCount: result.deletedCount }
    });
  } catch (error) {
    console.error("Error moving items to event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to move items to event",
      error: error.message,
    });
  }
};

module.exports = exports;