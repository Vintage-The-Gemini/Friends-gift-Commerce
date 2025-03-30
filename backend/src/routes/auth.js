// backend/src/routes/auth.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getCurrentUser);
router.post("/logout", logout);

module.exports = router;
