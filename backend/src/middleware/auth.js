// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Protect routes
// In backend/src/middleware/auth.js - replace or enhance the protect middleware
exports.protect = async (req, res, next) => {
  console.log("=== PROTECT MIDDLEWARE START ===");
  console.log("Request URL:", req.originalUrl);
  
  let token;

  // Check headers for token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Token found in Authorization header");
  } else {
    console.log("No token found in Authorization header");
  }

  if (!token) {
    console.log("No token available - authentication failed");
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route - no token provided"
    });
  }

  try {
    // Debug raw token
    console.log("Raw token:", token);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", JSON.stringify(decoded, null, 2));
    
    // Find user
    const user = await User.findById(decoded.id).select("-password");
    console.log("User from database:", user ? {
      id: user._id,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    } : "No user found");
    
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }
    
    // Check token role vs database role
    if (decoded.role) {
      console.log(`Token role: ${decoded.role}, Database role: ${user.role}`);
      
      if (decoded.role !== user.role) {
        console.log("WARNING: Role mismatch between token and database!");
      }
    } else {
      console.log("Token does not contain role information");
    }
    
    // Check if user is active
    if (!user.isActive) {
      console.log("User account is not active");
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated"
      });
    }
    
    // Set user in request
    req.user = user;
    console.log("Authentication successful, proceeding to next middleware");
    console.log("=== PROTECT MIDDLEWARE END ===");
    next();
  } catch (error) {
    console.log("Token verification error:", error.message);
    console.log("=== PROTECT MIDDLEWARE END WITH ERROR ===");
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route - invalid token"
    });
  }
};

// Grant access to specific roles
// Change from:
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

// Change to:
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Authorize middleware - User role:", req.user.role);
    console.log("Authorize middleware - Allowed roles:", roles);
    
    // Flatten the roles array if needed
    const flatRoles = roles.flat();
    console.log("Flattened roles:", flatRoles);
    
    if (!flatRoles.includes(req.user.role)) {
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

