// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    console.log("Starting Cloudinary upload for file:", file.originalname);
    console.log("Cloudinary configuration:", {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set",
      apiKey: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set",
    });

    // Create folder name based on environment
    const folder =
      process.env.NODE_ENV === "production"
        ? "friends-gift/products"
        : "friends-gift/products/dev";

    console.log("Upload folder:", folder);

    // Verify file exists and is readable
    try {
      const stats = fs.statSync(file.path);
      console.log("File stats:", {
        size: stats.size,
        path: file.path,
        exists: true,
      });
    } catch (fsError) {
      console.error("File system error:", fsError);
      throw new Error("Unable to read upload file");
    }

    // Upload the file
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: "auto",
    });

    console.log("Cloudinary upload successful:", {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
    });

    // Cleanup: Remove temporary file
    try {
      fs.unlinkSync(file.path);
      console.log("Temporary file cleaned up:", file.path);
    } catch (cleanupError) {
      console.warn("Warning: Failed to cleanup temporary file:", cleanupError);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error details:", {
      error: error.message,
      code: error.http_code,
      details: error.details,
    });
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    console.log("Attempting to delete from Cloudinary:", publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Error deleting file from Cloudinary");
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
