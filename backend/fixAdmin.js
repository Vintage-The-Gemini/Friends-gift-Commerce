// fixAdmin.js
const mongoose = require("mongoose");
const User = require("./src/models/User"); // Adjust path if needed
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      // Change the user with '+254700000000' to be an admin
      const updatedUser = await User.findOneAndUpdate(
        { phoneNumber: "+254700000000" },
        { role: "admin" },
        { new: true }
      );

      if (updatedUser) {
        console.log("User updated to admin:", {
          id: updatedUser._id,
          phone: updatedUser.phoneNumber,
          role: updatedUser.role,
        });
      } else {
        console.log("No user found with phone: +254700000000");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
