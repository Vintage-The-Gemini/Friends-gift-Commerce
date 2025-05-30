// backend/src/routes/wishlist.routes.js
const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  checkWishlistStatus,
  clearWishlist,
  moveToEvent,
} = require("../controllers/wishlist.controller");
const { protect } = require("../middleware/auth");

// Apply authentication to all routes
router.use(protect);

// Wishlist routes
router.route("/")
  .get(getWishlist)          // GET /api/wishlist - Get user's wishlist
  .post(addToWishlist)       // POST /api/wishlist - Add product to wishlist
  .delete(clearWishlist);    // DELETE /api/wishlist - Clear entire wishlist

// Product-specific routes
router.route("/:productId")
  .put(updateWishlistItem)   // PUT /api/wishlist/:productId - Update wishlist item
  .delete(removeFromWishlist); // DELETE /api/wishlist/:productId - Remove from wishlist

// Check if product is in wishlist
router.get("/check/:productId", checkWishlistStatus);

// Move items to event
router.post("/move-to-event", moveToEvent);

module.exports = router;