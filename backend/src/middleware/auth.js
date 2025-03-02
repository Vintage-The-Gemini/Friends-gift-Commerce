// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
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
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User account is deactivated",
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authorization",
    });
  }
};

// Authorization middleware - role-based access control
exports.authorize = (roles) => {
  return (req, res, next) => {
    // Convert single role to array if needed
    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${
          req.user.role
        } is not authorized to access this route. Required role(s): ${roleArray.join(
          ", "
        )}`,
      });
    }
    next();
  };
};
