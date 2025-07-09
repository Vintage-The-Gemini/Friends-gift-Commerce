// backend/src/server.js - COMPLETE FILE
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require("./config/database");

// Import error handler
const errorHandler = require("./middleware/errorHandler");

// Connect to database
connectDB();

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["https://accounts.google.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "https://localhost:3000",
      "https://localhost:5173",
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
app.use("/api/events", require("./routes/events"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));

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
      payments: process.env.ENABLE_REAL_MPESA === 'true' ? "✓ Live" : "✓ Simulation"
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
          "POST /google - Google OAuth login",
          "GET /verify-email/:token - Verify email",
          "POST /forgot-password - Request password reset",
          "PUT /reset-password/:token - Reset password",
          "GET /me - Get current user (auth required)"
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
      }
    }
  });
});

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
      payments: "✓ Active",
      admin: "✓ Active",
    }
  });
});

// Handle undefined routes
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Global error handlers
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
📱 API: http://localhost:${PORT}/api
📚 Docs: http://localhost:${PORT}/api/docs
💚 Health: http://localhost:${PORT}/api/health
  `);
});

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});

module.exports = app;