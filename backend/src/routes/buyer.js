// src/routes/buyer.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes here are protected and only accessible by buyers
router.use(protect);
router.use(authorize('buyer'));

router.get('/wishlist', (req, res) => {
    res.json({ message: 'Buyer wishlist' });
});

router.get('/orders', (req, res) => {
    res.json({ message: 'Buyer orders' });
});

module.exports = router;