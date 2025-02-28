// backend/src/routes/auth.js
const express = require("express");
const { register, login, logout, getProfile } = require("../controllers/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", getProfile);

module.exports = router;
