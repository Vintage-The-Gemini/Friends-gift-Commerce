// src/routes/analytics.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getSellerOverview,
  getSalesAnalytics,
} = require("../controllers/analytics.controller");

// All routes are protected and only accessible by sellers
router.use(protect);
router.use(authorize(["seller"]));

router.get("/overview", getSellerOverview);
router.get("/sales", getSalesAnalytics);

module.exports = router;
