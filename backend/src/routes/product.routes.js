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
router.get("/list", getProducts);
router.get("/detail/:id", getProduct);

// Protected seller routes
router.get(
  "/seller/products",
  protect,
  authorize("seller", "admin"),
  getSellerProducts
);

router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
