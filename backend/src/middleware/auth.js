// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token found, return error
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log the decoded token to debug role issues
    console.log("Decoded token:", decoded);

    // Get user from database
    req.user = await User.findById(decoded.id).select("-password");

    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Log the user role for debugging
    console.log("User role from database:", req.user.role);

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Authorize middleware - User role:", req.user.role);
    console.log("Authorize middleware - Allowed roles:", roles);
    
    if (!roles.includes(req.user.role)) {
      console.log("Role not authorized:", req.user.role);
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }
    
    console.log("Role authorized:", req.user.role);
    next();
  };
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
