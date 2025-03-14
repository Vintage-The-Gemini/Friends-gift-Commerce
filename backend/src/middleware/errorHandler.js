// backend/src/middleware/errorHandler.js
const mongoose = require("mongoose");

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error details:", err);

  // Log request details for debugging
  console.error(`Error in ${req.method} ${req.originalUrl}`);

  // Default error response structure
  let errorResponse = {
    success: false,
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  // Handle Mongoose/MongoDB CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError && err.kind === "ObjectId") {
    errorResponse.message = `Invalid ID format: ${err.value}`;
    return res.status(400).json(errorResponse);
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    errorResponse.message = "Validation failed";
    errorResponse.errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(errorResponse);
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    errorResponse.message = "Duplicate key error";
    errorResponse.field = Object.keys(err.keyValue)[0];
    return res.status(400).json(errorResponse);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    errorResponse.message = "Invalid token";
    return res.status(401).json(errorResponse);
  }

  if (err.name === "TokenExpiredError") {
    errorResponse.message = "Token expired";
    return res.status(401).json(errorResponse);
  }

  // Return 404 for specific error types
  if (err.message.includes("not found")) {
    return res.status(404).json(errorResponse);
  }

  // Return 403 for permission errors
  if (
    err.message.includes("not authorized") ||
    err.message.includes("permission")
  ) {
    return res.status(403).json(errorResponse);
  }

  // Default to 500 server error for unhandled errors
  res.status(err.statusCode || 500).json(errorResponse);
};

module.exports = errorHandler;
