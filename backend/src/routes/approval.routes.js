// backend/src/routes/approval.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getPendingProducts,
  getProductForReview,
  approveProduct,
  rejectProduct,
  getApprovalStats,
} = require("../controllers/productApproval.controller");

// Debug route to check authentication
router.get("/check-auth", protect, authorize(["admin"]), (req, res) => {
  res.json({
    success: true,
    message: "Approval route authentication successful",
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      isActive: req.user.isActive
    }
  });
});

// All routes in this file require admin authentication
router.use(protect);
router.use(authorize(["admin"]));

// Product approval routes
router.get("/products", getPendingProducts);
router.get("/products/:id", getProductForReview);
router.put("/products/:id/approve", approveProduct);
router.put("/products/:id/reject", rejectProduct);

// Statistics
router.get("/stats", getApprovalStats);

module.exports = router;