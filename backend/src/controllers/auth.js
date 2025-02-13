// backend/src/controllers/auth.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        console.log('Registration request:', req.body);
        const { name, phoneNumber, password, role, businessName } = req.body;

        // Check for existing user
        const userExists = await User.findOne({ phoneNumber });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Validate required fields based on role
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (role === 'seller' && !businessName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Business name is required for sellers'
            });
        }

        // Create user data object
        const userData = {
            name: name.trim(),
            phoneNumber,
            password,
            role,
            ...(role === 'seller' && { businessName: businessName.trim() })
        };

        // Create user
        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                ...(user.businessName && { businessName: user.businessName })
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // Validate inputs
        if (!phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone number and password'
            });
        }

        // Check for user
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                ...(user.businessName && { businessName: user.businessName })
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not fetch profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, location, profilePicture } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (location) user.location = location;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not update profile'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // Clear cookie if using cookies
        res.clearCookie('token');
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};