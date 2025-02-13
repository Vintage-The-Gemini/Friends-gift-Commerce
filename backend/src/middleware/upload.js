// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Log file information
  console.log("Processing upload file:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    console.log("File rejected - invalid type:", file.originalname);
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }

  console.log("File accepted:", file.originalname);
  cb(null, true);
};

// Export multer config
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5, // Maximum 5 files
  },
});

// Error handling middleware
exports.uploadErrorHandler = (err, req, res, next) => {
  console.error("Upload error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field",
      });
    }
  }

  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      message: req.fileValidationError,
    });
  }

  // For any other errors
  return res.status(500).json({
    success: false,
    message: "File upload error",
    error: err.message,
  });
};

// Cleanup middleware - removes uploaded files after request is complete
exports.cleanupFiles = (req, res, next) => {
  res.on("finish", () => {
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error cleaning up file:", err);
        });
      });
    }
  });
  next();
};
