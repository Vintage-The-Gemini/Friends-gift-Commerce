// src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// Logger middleware for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin.routes");
const sellerRoutes = require("./routes/seller.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const eventRoutes = require("./routes/event.routes");
const orderRoutes = require("./routes/order.routes");
const contributionRoutes = require("./routes/contribution.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const buyerRoutes = require("./routes/buyer");
const initializeAdmin = require("./utils/initAdmin");
const User = require("./models/User");

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

// Basic route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Friends Gift API",
    version: "1.0.0",
    status: "Running",
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

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  // process.exit(1);
});
