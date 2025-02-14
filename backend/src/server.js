// src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin.routes");
const sellerRoutes = require("./routes/seller.routes"); // Add this line
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const eventRoutes = require("./routes/event.routes");
const orderRoutes = require("./routes/order.routes");
const contributionRoutes = require("./routes/contribution.routes");
// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes); // Add this line
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contributions", contributionRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Friends Gift API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
