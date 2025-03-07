// checkAdmin.js
const mongoose = require("mongoose");
const User = require("./src/models/User"); // Adjust path if needed
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      // Find all admin users
      const adminUsers = await User.find({ role: "admin" });

      console.log(`Found ${adminUsers.length} admin users:`);
      adminUsers.forEach((admin, index) => {
        console.log(`Admin #${index + 1}:`, {
          id: admin._id,
          name: admin.name,
          phone: admin.phoneNumber,
          active: admin.isActive,
          createdAt: admin.createdAt,
        });
      });

      // Check specific phone number
      const specificAdmin = await User.findOne({
        phoneNumber: "+254700000000",
      });

      console.log(
        "Specific admin search result:",
        specificAdmin ? "Found" : "Not Found"
      );

      if (specificAdmin) {
        console.log("Admin details:", {
          id: specificAdmin._id,
          role: specificAdmin.role,
          phone: specificAdmin.phoneNumber,
        });
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
