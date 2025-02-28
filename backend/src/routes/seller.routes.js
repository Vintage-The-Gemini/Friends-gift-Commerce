const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile,
} = require("../controllers/business.controller");

// Business Profile Routes
router.get(
  "/business-profile",
  protect,
  authorize("seller"),
  getBusinessProfile
);
router.post(
  "/business-profile",
  protect,
  authorize("seller"),
  createBusinessProfile
);
router.put(
  "/business-profile",
  protect,
  authorize("seller"),
  updateBusinessProfile
);

module.exports = router;
