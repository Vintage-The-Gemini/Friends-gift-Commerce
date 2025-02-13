// routes/category.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryCharacteristics,
} = require("../controllers/category.controller");

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategory);
router.get("/:id/characteristics", getCategoryCharacteristics);

// Protected admin routes
router.use(protect);
router.use(authorize(["admin"]));

router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
