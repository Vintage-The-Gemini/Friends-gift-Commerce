// src/routes/seller.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes here are protected and only accessible by sellers
router.use(protect);
router.use(authorize('seller'));

router.get('/products', (req, res) => {
    res.json({ message: 'Seller products' });
});

router.post('/products', (req, res) => {
    res.json({ message: 'Create product' });
});

module.exports = router;
