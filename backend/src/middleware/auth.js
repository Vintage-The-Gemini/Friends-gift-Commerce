// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if no token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Flatten the roles array if needed
    const flatRoles = roles.flat();

    console.log(
      "Authorize middleware - User role:",
      req.user.role,
      "Required roles:",
      flatRoles
    );

    if (!flatRoles.includes(req.user.role)) {
      console.log("Authorization failed - role does not match");
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    console.log("Authorization successful");
    next();
  };
};

module.exports = { protect, authorize };
