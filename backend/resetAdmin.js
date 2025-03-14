// resetAdmin.js
const mongoose = require("mongoose");
const User = require("./src/models/user"); // Adjust path if needed
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      // 1. Delete any existing user with our target phone number
      await User.deleteMany({
        phoneNumber: { $in: ["+254700000000", "254700000000"] },
      });
      console.log("Deleted existing users with admin phone numbers");

      // 2. Create fresh admin user with explicit password hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const admin = await User.create({
        name: "System Administrator",
        phoneNumber: "+254700000000",
        password: hashedPassword, // Pre-hashed password
        role: "admin",
        isActive: true,
      });

      console.log("Admin created successfully:", {
        id: admin._id,
        name: admin.name,
        phone: admin.phoneNumber,
        role: admin.role,
      });

      // 3. Verify the admin can be found with login query
      const foundAdmin = await User.findOne({
        phoneNumber: "+254700000000",
        role: "admin",
      });

      console.log("Admin verification:", foundAdmin ? "SUCCESSFUL" : "FAILED");

      if (foundAdmin) {
        console.log("Login should work with:");
        console.log("Phone: +254700000000");
        console.log("Password: admin123");
      }
    } catch (error) {
      console.error("Error resetting admin:", error);
      console.error("Error details:", error.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
