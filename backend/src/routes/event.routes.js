const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getUserEvents, // Add this import
} = require("../controllers/event.controller");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEvent);

// Protected routes
router.post("/", protect, upload.single("image"), createEvent);

router.put("/:id", protect, upload.single("image"), updateEvent);

router.delete("/:id", protect, deleteEvent);

router.get("/my-events", protect, getUserEvents);

module.exports = router;
