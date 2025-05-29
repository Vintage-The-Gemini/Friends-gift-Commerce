// backend/src/server.js - ENHANCED VERSION
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("./src/middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
if (process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://friendsgift.co.ke",
      "https://friends-gifts-commerce-67e63--testing-wu87kkga.web.app",
    ],
    origin: true,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Import routes
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin.routes");
const sellerRoutes = require("./src/routes/seller.routes");
const categoryRoutes = require("./src/routes/category.routes");
const productRoutes = require("./src/routes/product.routes");
const eventRoutes = require("./src/routes/event.routes");
const orderRoutes = require("./src/routes/order.routes");
const contributionRoutes = require("./src/routes/contribution.routes");
const analyticsRoutes = require("./src/routes/analytics.routes");
const buyerRoutes = require("./src/routes/buyer");
const approvalRoutes = require("./src/routes/approval.routes");

// ⭐ NEW: Import notification routes
const notificationRoutes = require("./src/routes/notification.routes");

const initializeAdmin = require("./src/utils/initAdmin");
const User = require("./src/models/user");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/seller/analytics", analyticsRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/admin/approvals", approvalRoutes);

// ⭐ NEW: Mount notification routes
app.use("/api/notifications", notificationRoutes);

// Initialize admin
initializeAdmin();

// Admin user check
setTimeout(async () => {
  try {
    const adminUser = await User.findOne({ role: "admin" });
    console.log(
      "Admin user check:",
      adminUser
        ? {
            exists: true,
            id: adminUser._id,
            phone: adminUser.phoneNumber,
            active: adminUser.isActive,
          }
        : "No admin user found"
    );
  } catch (err) {
    console.error("Admin check error:", err);
  }
}, 2000);

// ⭐ NEW: Initialize notification system in development
if (process.env.NODE_ENV !== "production") {
  // M-PESA test utilities
  try {
    const mpesaTestUtils = require("./src/utils/mpesaTestUtils");
    mpesaTestUtils.setupTestEndpoint(app);
    console.log("M-PESA test utilities enabled at /api/test/mpesa-callback");
  } catch (error) {
    console.warn("Failed to set up M-PESA test utilities:", error.message);
  }

  // ⭐ NEW: Notification testing endpoints
  app.post("/api/test/notifications/welcome", async (req, res) => {
    try {
      const { triggerWelcomeNotification } = require("./src/utils/notificationTriggers");
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({
          success: false,
          message: "userId and role are required"
        });
      }

      await triggerWelcomeNotification(userId, role);
      res.json({ success: true, message: "Welcome notification triggered" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/test/notifications/contribution", async (req, res) => {
    try {
      const { triggerEventContribution } = require("./src/utils/notificationTriggers");
      const { eventId, contributorId, amount } = req.body;
      
      if (!eventId || !contributorId || !amount) {
        return res.status(400).json({
          success: false,
          message: "eventId, contributorId, and amount are required"
        });
      }

      await triggerEventContribution({ eventId, contributorId, amount });
      res.json({ success: true, message: "Contribution notification triggered" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/test/notifications/product-approval", async (req, res) => {
    try {
      const { triggerProductApproval } = require("./src/utils/notificationTriggers");
      const { productId, status, reason } = req.body;
      
      if (!productId || !status) {
        return res.status(400).json({
          success: false,
          message: "productId and status are required"
        });
      }

      await triggerProductApproval(productId, status, reason);
      res.json({ success: true, message: "Product approval notification triggered" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  console.log("🔔 Notification test endpoints enabled:");
  console.log("  POST /api/test/notifications/welcome");
  console.log("  POST /api/test/notifications/contribution");
  console.log("  POST /api/test/notifications/product-approval");
}

// ⭐ NEW: Optional - Start scheduled notification jobs
if (process.env.ENABLE_NOTIFICATION_JOBS === "true") {
  try {
    const { startScheduledJobs } = require("./src/jobs/notificationJobs");
    startScheduledJobs();
    console.log("📅 Scheduled notification jobs started");
  } catch (error) {
    console.warn("Failed to start notification jobs:", error.message);
  }
}

// Basic route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Friends Gift API",
    version: "1.0.0",
    status: "Running",
    notifications: "Enabled", // ⭐ NEW: Indicate notifications are available
  });
});

// 404 handler - must come BEFORE error handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handling middleware
app.use(errorHandler);

// Set up server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log("🔔 Notification system ready");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  // process.exit(1);
});

module.exports = server;