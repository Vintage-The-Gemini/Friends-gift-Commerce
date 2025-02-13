// src/routes/seller.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile,
} = require("../controllers/business.controller");

// Business Profile Routes
router.post(
  "/business-profile",
  protect,
  authorize("seller"),
  createBusinessProfile
);
router.get(
  "/business-profile",
  protect,
  authorize("seller"),
  getBusinessProfile
);
router.put(
  "/business-profile",
  protect,
  authorize("seller"),
  updateBusinessProfile
);

module.exports = router;
