// backend/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// Import controllers
const adminController = require("../controllers/admin.controller");
const productController = require("../controllers/admin.product.controller");
const orderController = require("../controllers/admin.order.controller");
const adminCategoryRoutes = require("./admin.category.routes");

// Public admin route - no authentication required
router.post("/login", adminController.adminLogin);

router.get("/check-auth", protect, (req, res) => {
  res.json({
    success: true,
    message: "Authentication check successful",
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      isActive: req.user.isActive
    },
    headers: {
      authorization: req.headers.authorization ? "Present (not shown)" : "Missing"
    }
  });
});

// Apply protection to all routes below
router.use(protect);
router.use(authorize(["admin"]));

// Use category admin routes
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

// Product management routes
router.route("/products").get(productController.getProducts);
router.route("/products/pending").get(productController.getPendingProducts);
router
  .route("/products/approval-stats")
  .get(productController.getApprovalStats);
router.route("/products/:id").get(productController.getProduct);
router.route("/products/:id/approve").put(productController.approveProduct);
router.route("/products/:id/reject").put(productController.rejectProduct);

// Order management routes
router.route("/orders").get(orderController.getOrders);
router.route("/orders/stats").get(orderController.getOrderStats);
router.route("/orders/export").get(orderController.exportOrders);
router
  .route("/orders/:id")
  .get(orderController.getOrder)
  .put(orderController.updateOrder);

// Category management routes
router
  .route("/categories")
  .get(adminController.getCategories)
  .post(adminController.createCategory);
router
  .route("/categories/:id")
  .put(adminController.updateCategory)
  .delete(adminController.deleteCategory);

// Event management routes
router.route("/events").get(adminController.getEvents);
router
  .route("/events/:id")
  .get(adminController.getEvent)
  .put(adminController.updateEvent)
  .delete(adminController.deleteEvent);

// Contribution management routes
router.route("/contributions").get(adminController.getContributions);

module.exports = router;