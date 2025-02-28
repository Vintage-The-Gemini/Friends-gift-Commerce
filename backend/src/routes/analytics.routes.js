// In backend/src/routes/analytics.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getSellerOverview,
  getSalesAnalytics,
  getProductPerformance,
  getCustomerInsights,
} = require("../controllers/analytics.controller");

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize(["seller"]));

// Analytics routes
router.get("/overview", getSellerOverview);
router.get("/sales", getSalesAnalytics);
router.get("/products", getProductPerformance);
router.get("/customers", getCustomerInsights);

module.exports = router;
