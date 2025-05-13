// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");

// Import category routes
const adminCategoryRoutes = require("./admin.category.routes");

// Public admin route - no authentication required
router.post("/login", adminController.adminLogin);

// Apply protection to all routes below
router.use(protect);
router.use(authorize(["admin"]));

// Use category routes for /admin/categories
router.use("/categories", adminCategoryRoutes);

// Dashboard routes
router.get("/dashboard/stats", adminController.getDashboardStats);

// User management routes
router
  .route("/users")
  .get(adminController.getUsers)
  .post(adminController.createUser);
router
  .route("/users/:id")
  .get(adminController.getUser)
  .put(adminController.updateUser)
  .delete(adminController.deleteUser);

// Seller management routes
router.route("/sellers").get(adminController.getSellers);
router.route("/sellers/:id/approve").put(adminController.approveSeller);
router.route("/sellers/:id/suspend").put(adminController.suspendSeller);

// Other admin routes...

module.exports = router;
