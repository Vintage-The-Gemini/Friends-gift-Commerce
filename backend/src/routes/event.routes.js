// backend/src/routes/event.routes.js
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
  getUserEvents,
  inviteUsers,
  respondToInvitation,
  getEventContributions,
  getPrivateEvent,
} = require("../controllers/event.controller");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEvent);

// Protected routes (require authentication)
router.use(protect);

// User's events routes
router.get("/my-events", getUserEvents);

// Event creation and management
router.post("/", upload.single("image"), createEvent);
router.put("/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);

// Invitation handling
router.post("/:id/invite", inviteUsers);
router.post("/:id/respond", respondToInvitation);

// Access-controlled routes
router.get("/:id/access", getPrivateEvent);

// Contributions
router.get("/:id/contributions", getEventContributions);

module.exports = router;
