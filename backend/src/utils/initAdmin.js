// src/utils/initAdmin.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initializeAdmin = async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const adminUser = await User.create({
            phoneNumber: process.env.ADMIN_PHONE || '254700000000',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin'
        });

        console.log('Admin user created successfully:', adminUser.phoneNumber);
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

module.exports = initializeAdmin;