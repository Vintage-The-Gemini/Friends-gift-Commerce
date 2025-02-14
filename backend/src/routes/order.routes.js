const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  cancelOrder,
} = require("../controllers/order.controller");

// All routes are protected
router.use(protect);

// Routes
router.route("/").post(createOrder).get(getOrders);

router
  .route("/:id")
  .get(getOrder)
  .put(authorize("seller", "admin"), updateOrder)
  .delete(cancelOrder);

module.exports = router;
