// src/controllers/admin.controller.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // Find admin user
        const admin = await User.findOne({ phoneNumber, role: 'admin' });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin._id);

        res.json({
            success: true,
            token,
            user: {
                id: admin._id,
                name: admin.name,
                phoneNumber: admin.phoneNumber,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Admin only
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments({ role: 'buyer' }),
            totalSellers: await User.countDocuments({ role: 'seller' }),
            totalEvents: 0, // You can add this when you have Events model
            totalProducts: 0 // You can add this when you have Products model
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
};

// Your existing user management functions
exports.createUser = async (req, res) => {
    try {
        const { phoneNumber, password, role, businessName } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ phoneNumber });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user with admin as creator
        const user = await User.create({
            phoneNumber,
            password,
            role,
            businessName,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                role: user.role,
                businessName: user.businessName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('createdBy', 'phoneNumber');

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'phoneNumber');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { phoneNumber, role, businessName, isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (role) user.role = role;
        if (businessName) user.businessName = businessName;
        if (typeof isActive !== 'undefined') user.isActive = isActive;

        await user.save();

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Instead of deleting, deactivate the user
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'User deactivated successfully'p
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};