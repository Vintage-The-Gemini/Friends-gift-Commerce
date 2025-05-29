// backend/src/routes/contribution.routes.js - FIXED
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Import all controller functions with proper error checking
const {
  createContribution,
  getEventContributions,
  getUserContributions,
  updateContributionStatus,
  getContribution,
  handleMpesaCallback
} = require("../controllers/contribution.controller");

// Verify all imports are defined
const requiredFunctions = {
  createContribution,
  getEventContributions,
  getUserContributions,
  updateContributionStatus,
  getContribution,
  handleMpesaCallback
};

// Check for undefined functions
Object.entries(requiredFunctions).forEach(([name, func]) => {
  if (typeof func !== 'function') {
    console.error(`❌ Controller function '${name}' is undefined in contribution.controller.js`);
    throw new Error(`Missing controller function: ${name}`);
  }
});

console.log("✅ All contribution controller functions imported successfully");

// M-PESA callback route (no auth required for webhook)
router.post("/mpesa/callback", handleMpesaCallback);

// Protected routes (require authentication)
router.use(protect);

// Create contribution
router.post("/", createContribution);

// Get user's contributions
router.get("/user", getUserContributions);

// Get contributions for specific event
router.get("/event/:eventId", getEventContributions);

// Get single contribution
router.get("/:id", getContribution);

// Update contribution status (admin/system use)
router.put("/:id", updateContributionStatus);

module.exports = router;