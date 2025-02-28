// backend/src/routes/seller.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller"); // Use the existing product controller
const { upload } = require("../middleware/upload"); // For image uploads
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

// Product Routes - Add these routes
router.get("/products", protect, authorize("seller"), getSellerProducts);
router.post(
  "/products",
  protect,
  authorize("seller"),
  upload.array("images", 5), // Allow up to 5 images
  createProduct
);
router.put(
  "/products/:id",
  protect,
  authorize("seller"),
  upload.array("images", 5),
  updateProduct
);
router.delete("/products/:id", protect, authorize("seller"), deleteProduct);

module.exports = router;
