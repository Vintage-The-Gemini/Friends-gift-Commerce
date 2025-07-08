// backend/src/routes/auth.js
const express = require("express");
const {
  register,
  login,
  googleLogin,
  getMe,
  verifyEmail,
  updateProfile,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);  // ✅ Correct endpoint
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;