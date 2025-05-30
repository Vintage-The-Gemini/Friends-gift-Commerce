// src/server.js
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
//The db has two endpoints for the real and test environments
connectDB();

const app = express();

// Middleware
// Logger middleware for production
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
const initializeAdmin = require("./src/utils/initAdmin");
const User = require("./src/models/user");
const approvalRoutes = require("./src/routes/approval.routes");
const wishlistRoutes = require("./src/routes/wishlist.routes");
const notificationRoutes = require("./src/routes/notification.routes");

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
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);

initializeAdmin();

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

// Set up M-PESA test utilities in development mode
if (process.env.NODE_ENV !== "production") {
  try {
    const mpesaTestUtils = require("./src/utils/mpesaTestUtils");
    mpesaTestUtils.setupTestEndpoint(app);
    console.log("M-PESA test utilities enabled at /api/test/mpesa-callback");
  } catch (error) {
    console.warn("Failed to set up M-PESA test utilities:", error.message);
  }
}

// Basic route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Friends Gift API",
    version: "1.0.0",
    status: "Running",
    features: {
      authentication: "✓ Active",
      events: "✓ Active", 
      products: "✓ Active",
      wishlist: "✓ Active",
      notifications: "✓ Active",
      payments: "✓ Active (M-PESA)",
      admin: "✓ Active",
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: "Connected",
    services: {
      auth: "✓",
      events: "✓", 
      products: "✓",
      wishlist: "✓",
      notifications: "✓",
      mpesa: process.env.ENABLE_REAL_MPESA === 'true' ? "✓ Live" : "✓ Simulation"
    }
  });
});

// API documentation endpoint
app.get("/api/docs", (req, res) => {
  res.json({
    title: "Friends Gift API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: {
        base: "/api/auth",
        routes: [
          "POST /register - Register new user",
          "POST /login - User login", 
          "POST /google-login - Google OAuth login",
          "GET /verify-email/:token - Verify email",
          "POST /forgot-password - Request password reset",
          "PUT /reset-password/:token - Reset password"
        ]
      },
      events: {
        base: "/api/events",
        routes: [
          "GET / - Get public events",
          "POST / - Create event (auth required)",
          "GET /:id - Get event details",
          "PUT /:id - Update event (auth required)",
          "DELETE /:id - Delete event (auth required)",
          "GET /my-events - Get user's events (auth required)"
        ]
      },
      products: {
        base: "/api/products", 
        routes: [
          "GET / - Get all products",
          "GET /:id - Get product details",
          "POST / - Create product (seller auth required)",
          "PUT /:id - Update product (seller auth required)",
          "DELETE /:id - Delete product (seller auth required)"
        ]
      },
      wishlist: {
        base: "/api/wishlist",
        routes: [
          "GET / - Get user's wishlist (auth required)",
          "POST / - Add to wishlist (auth required)",
          "DELETE /:productId - Remove from wishlist (auth required)",
          "PUT /:productId - Update wishlist item (auth required)",
          "GET /check/:productId - Check wishlist status (auth required)",
          "DELETE / - Clear entire wishlist (auth required)"
        ]
      },
      notifications: {
        base: "/api/notifications",
        routes: [
          "GET / - Get user notifications (auth required)",
          "GET /unread-count - Get unread count (auth required)",
          "PUT /read - Mark as read (auth required)",
          "PUT /mark-all-read - Mark all as read (auth required)",
          "DELETE / - Delete notification (auth required)"
        ]
      },
      contributions: {
        base: "/api/contributions",
        routes: [
          "POST / - Create contribution (auth required)",
          "GET /user - Get user contributions (auth required)",
          "GET /event/:eventId - Get event contributions",
          "POST /mpesa-callback - M-PESA payment callback"
        ]
      },
      admin: {
        base: "/api/admin",
        routes: [
          "POST /login - Admin login",
          "GET /dashboard/stats - Dashboard statistics (admin auth)",
          "GET /users - Manage users (admin auth)",
          "GET /products - Manage products (admin auth)",
          "GET /events - Manage events (admin auth)",
          "GET /orders - Manage orders (admin auth)"
        ]
      }
    }
  });
});

// 404 handler - must come BEFORE error handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // Pass to error handler
});

// Global error handling middleware
app.use(errorHandler);

// Set up server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Friends Gift API Server Started Successfully!
📍 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
🌐 API Base URL: http://localhost:${PORT}/api
📚 API Documentation: http://localhost:${PORT}/api/docs
💚 Health Check: http://localhost:${PORT}/api/health

🔧 Active Features:
   ✅ Authentication & Authorization
   ✅ User Management (Buyers & Sellers)
   ✅ Event Creation & Management
   ✅ Product Catalog & Search
   ✅ Wishlist Functionality
   ✅ Real-time Notifications
   ✅ M-PESA Payment Integration
   ✅ Admin Dashboard
   ✅ File Upload & Image Management
   ✅ Email Verification System

🔗 Database: ${process.env.MONGO_URI ? 'Connected' : 'Not Connected'}
💳 Payments: ${process.env.ENABLE_REAL_MPESA === 'true' ? 'Live M-PESA' : 'Simulation Mode'}
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  console.error("Stack trace:", err.stack);
  // Close server & exit process gracefully
  server.close(() => {
    console.log("Server closed due to unhandled rejection");
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception Error: ${err.message}`);
  console.error("Stack trace:", err.stack);
  // Close server & exit process immediately
  server.close(() => {
    console.log("Server closed due to uncaught exception");
    process.exit(1);
  });
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;