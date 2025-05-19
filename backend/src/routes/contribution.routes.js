const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createContribution,
  getEventContributions,
  getUserContributions,
  updateContributionStatus,
  getContribution,
  handleMpesaCallback,
} = require("../controllers/contribution.controller");

// Public route for M-PESA callback (must be accessible without auth)
router.post("/mpesa-callback", handleMpesaCallback);

// All other routes are protected
router.use(protect);

// Routes
router.route("/").post(createContribution);

router.get("/user", getUserContributions);
router.get("/event/:eventId", getEventContributions);

router
  .route("/:id")
  .get(getContribution)
  .put(authorize("admin"), updateContributionStatus);

module.exports = router;