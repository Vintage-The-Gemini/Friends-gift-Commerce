// backend/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  adminLogin,
  getDashboardStats,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrder,
  updateOrder,
  getContributions,
  getSellers,
  approveSeller,
  suspendSeller,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/admin.controller");

// Public admin routes
router.post("/login", adminLogin);

// Apply protection to all routes below
router.use(protect);
router.use(authorize(["admin"]));

// Dashboard stats
router.get("/dashboard/stats", getDashboardStats);

// User management routes
router.route("/users").get(getUsers).post(createUser);

router.route("/users/:id").get(getUser).put(updateUser).delete(deleteUser);

// Event management routes
router.route("/events").get(getEvents);

router.route("/events/:id").get(getEvent).put(updateEvent).delete(deleteEvent);

// Product management routes
router.route("/products").get(getProducts);

router
  .route("/products/:id")
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

// Order management routes
router.route("/orders").get(getOrders);

router.route("/orders/:id").get(getOrder).put(updateOrder);

// Seller management routes
router.route("/sellers").get(getSellers);

router.route("/sellers/:id/approve").put(approveSeller);

router.route("/sellers/:id/suspend").put(suspendSeller);

// Category management routes
router.route("/categories").get(getCategories).post(createCategory);

router.route("/categories/:id").put(updateCategory).delete(deleteCategory);

// Contribution routes
router.route("/contributions").get(getContributions);

module.exports = router;
