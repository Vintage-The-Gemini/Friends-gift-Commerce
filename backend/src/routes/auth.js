// backend/src/routes/auth.js - COMPLETE FILE
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Import all auth controller functions
const {
  register,
  login,
  googleLogin,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", login);

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
router.post("/google", googleLogin);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, getMe);

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get("/verify-email/:token", verifyEmail);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post("/forgot-password", forgotPassword);

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put("/reset-password/:token", resetPassword);

module.exports = router;