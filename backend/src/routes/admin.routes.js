// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    adminLogin,
    getDashboardStats,
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/admin.controller');

// Public admin routes
router.post('/login', adminLogin);

// Apply protection to all routes below
router.use(protect);
router.use(authorize(['admin']));

// Protected admin routes
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.route('/users')
    .get(getUsers)
    .post(createUser);

router.route('/users/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;