// backend/src/routes/admin.category.routes.js
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

const {
  seedCategories,
  importCategories,
  bulkUpdateCategories
} = require("../controllers/category.admin.controller");

// Basic CRUD operations (these are already defined in the main admin routes)
router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/:id/characteristics", getCategoryCharacteristics);

// Advanced operations for admin UI
router.post("/seed", seedCategories);
router.post("/import", importCategories);
router.post("/bulk", bulkUpdateCategories);

module.exports = router;