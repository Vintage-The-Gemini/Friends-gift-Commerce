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
  updateEventStatus,
  getEventCheckoutEligibility,
  completeEventCheckout,
  debugCheckout // Add this import
} = require("../controllers/event.controller");

// Public routes
router.get("/", getEvents);

// Protected routes (require authentication)
router.use(protect);

// IMPORTANT: Place specific routes BEFORE parameterized routes
// User's events routes - fix the order to prevent "my-events" being treated as an ID
router.get("/my-events", getUserEvents);

// Event creation - no ID parameter
router.post("/", upload.single("image"), createEvent);

// Checkout routes - make sure these handlers exist in your controller
router.get("/:id/checkout-status", protect, getEventCheckoutEligibility);
router.post("/:id/checkout", protect, completeEventCheckout);
router.get("/:id/debug-checkout", protect, debugCheckout); // Add this debug route

// Parameterized routes - must come AFTER specific routes
router.get("/:id", getEvent);
router.put("/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);
router.post("/:id/invite", inviteUsers);
router.post("/:id/respond", respondToInvitation);
router.get("/:id/access", getPrivateEvent);
router.get("/:id/contributions", getEventContributions);

// Status update route - support both PATCH and PUT methods
router.patch("/:id/status", updateEventStatus);
router.put("/:id/status", updateEventStatus); // Adding PUT method for better compatibility

module.exports = router;