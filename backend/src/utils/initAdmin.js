// src/utils/initAdmin.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const initializeAdmin = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Admin credentials for logging (don't log the actual password)
    const adminPhone = process.env.ADMIN_PHONE || "+254700000000";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log("Creating admin user with phone:", adminPhone);

    // Create admin user
    const adminUser = await User.create({
      name: "System Administrator",
      phoneNumber: adminPhone,
      password: adminPassword, // This will be hashed by the User model pre-save hook
      role: "admin",
      isActive: true,
    });

    console.log("Admin user created successfully:", adminUser.phoneNumber);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = initializeAdmin;
