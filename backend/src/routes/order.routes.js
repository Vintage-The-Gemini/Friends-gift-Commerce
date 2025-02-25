// src/routes/order.routes.js

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/order.controller");

// All routes are protected
router.use(protect);

// Routes
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", authorize(["seller"]), updateOrderStatus);
router.delete("/:id", cancelOrder);

module.exports = router;
