// backend/scripts/resetAdminPassword.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define a simplified User model that matches your existing one
const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  password: String,
  role: String,
  isActive: Boolean,
});

// Add password hashing method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Use the existing model or create a temporary one
const User = mongoose.model("User", userSchema);

// New admin password - CHANGE THIS TO YOUR DESIRED PASSWORD
const NEW_ADMIN_PASSWORD = "admin123";
// Admin phone number - MAKE SURE THIS MATCHES YOUR ADMIN'S PHONE NUMBER
const ADMIN_PHONE = "+254700000000";

const resetAdminPassword = async () => {
  try {
    // Find the admin user
    const admin = await User.findOne({
      phoneNumber: ADMIN_PHONE,
      role: "admin",
    });

    if (!admin) {
      console.log("Admin user not found with phone number:", ADMIN_PHONE);
      return;
    }

    console.log("Found admin user:", admin.name);

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_ADMIN_PASSWORD, salt);

    // Update admin's password
    admin.password = hashedPassword;
    await admin.save();

    console.log("Admin password has been reset successfully!");
    console.log("New admin credentials:");
    console.log("Phone:", ADMIN_PHONE);
    console.log("Password:", NEW_ADMIN_PASSWORD);

    // Verify the password works
    const isMatch = await admin.matchPassword(NEW_ADMIN_PASSWORD);
    console.log("Password verification:", isMatch ? "SUCCESSFUL" : "FAILED");
  } catch (error) {
    console.error("Error resetting admin password:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

resetAdminPassword();
