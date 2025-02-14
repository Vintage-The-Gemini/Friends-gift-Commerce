// routes/product.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} = require("../controllers/product.controller");

// Public routes
router.get("/", getProducts); // Get all products
router.get("/:id", getProduct); // Get single product

// Protected routes (require authentication)
router.use(protect);

// Seller routes
router.get("/seller/products", authorize("seller"), getSellerProducts);

router.post("/", authorize("seller"), upload.array("images", 5), createProduct);

router.put(
  "/:id",
  authorize("seller"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", authorize("seller"), deleteProduct);

module.exports = router;
