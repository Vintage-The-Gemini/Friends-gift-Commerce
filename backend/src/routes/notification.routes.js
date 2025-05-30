// STEP 1: backend/src/routes/wishlist.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Simple wishlist controller for now
const wishlistController = {
  getWishlist: async (req, res) => {
    try {
      // Return mock data for now
      res.json({
        success: true,
        data: [],
        stats: {
          totalItems: 0,
          availableItems: 0,
          totalValue: 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch wishlist",
        error: error.message
      });
    }
  },

  addToWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required"
        });
      }

      // For now, just return success
      res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: {
          productId,
          userId: req.user._id,
          addedAt: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to add to wishlist",
        error: error.message
      });
    }
  },

  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.params;
      
      res.json({
        success: true,
        message: "Product removed from wishlist"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to remove from wishlist",
        error: error.message
      });
    }
  },

  checkWishlistStatus: async (req, res) => {
    try {
      const { productId } = req.params;
      
      res.json({
        success: true,
        data: { isInWishlist: false }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to check wishlist status",
        error: error.message
      });
    }
  },

  clearWishlist: async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Wishlist cleared",
        data: { deletedCount: 0 }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to clear wishlist",
        error: error.message
      });
    }
  }
};

// Apply authentication to all routes
router.use(protect);

// Wishlist routes
router.route("/")
  .get(wishlistController.getWishlist)
  .post(wishlistController.addToWishlist)
  .delete(wishlistController.clearWishlist);

router.route("/:productId")
  .delete(wishlistController.removeFromWishlist);

router.get("/check/:productId", wishlistController.checkWishlistStatus);

module.exports = router;

// =============================================================================

// STEP 2: backend/src/routes/notification.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Simple notification controller
const notificationController = {
  getUserNotifications: async (req, res) => {
    try {
      const mockNotifications = [
        {
          _id: '1',
          type: 'welcome',
          title: 'Welcome to Friends Gift! 🎉',
          message: 'Welcome to Friends Gift! Start creating events and sharing your wishlist with friends and family.',
          isRead: false,
          priority: 'normal',
          createdAt: new Date().toISOString(),
          actionUrl: null
        }
      ];

      res.json({
        success: true,
        data: mockNotifications,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        },
        unreadCount: 1
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message
      });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      res.json({
        success: true,
        count: 1
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch unread count",
        error: error.message
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark as read",
        error: error.message
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      res.json({
        success: true,
        message: "All notifications marked as read"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark all as read",
        error: error.message
      });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Notification deleted"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message
      });
    }
  }
};

// Apply authentication to all routes
router.use(protect);

// Notification routes
router.route("/")
  .get(notificationController.getUserNotifications)
  .delete(notificationController.deleteNotification);

router.get("/unread-count", notificationController.getUnreadCount);
router.put("/read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead);

module.exports = router;

// =============================================================================

// STEP 3: Update backend/src/server.js to include these routes
// Add these lines to your server.js file:

/*
const wishlistRoutes = require("./src/routes/wishlist.routes");
const notificationRoutes = require("./src/routes/notification.routes");

// Mount routes
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
*/

// =============================================================================

// STEP 4: Create simplified frontend fallback service
// frontend/src/services/api/fallback.js
const fallbackWishlistService = {
  addToWishlist: async (productId) => {
    // Use localStorage as fallback
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];
      
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('friendsgift_wishlist', JSON.stringify(wishlist));
      }
      
      return {
        success: true,
        message: "Added to wishlist (local storage)"
      };
    } catch (error) {
      throw new Error("Failed to add to wishlist");
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];
      const updated = wishlist.filter(id => id !== productId);
      localStorage.setItem('friendsgift_wishlist', JSON.stringify(updated));
      
      return {
        success: true,
        message: "Removed from wishlist (local storage)"
      };
    } catch (error) {
      throw new Error("Failed to remove from wishlist");
    }
  },

  getWishlist: async () => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];
      
      return {
        success: true,
        data: wishlist.map(id => ({ product: { _id: id } })),
        stats: { totalItems: wishlist.length }
      };
    } catch (error) {
      throw new Error("Failed to get wishlist");
    }
  },

  checkWishlistStatus: async (productId) => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];
      
      return {
        success: true,
        data: { isInWishlist: wishlist.includes(productId) }
      };
    } catch (error) {
      throw new Error("Failed to check status");
    }
  }
};

// Export the fallback service
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fallbackWishlistService };
}