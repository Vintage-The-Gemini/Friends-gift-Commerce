// backend/src/controllers/business.controller.js
const BusinessProfile = require("../models/BusinessProfile");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * @desc    Create business profile for seller
 * @route   POST /api/seller/business-profile
 * @access  Private/Seller
 */
exports.createBusinessProfile = async (req, res) => {
  try {
    // Verify user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create business profiles",
      });
    }

    // Check if profile already exists
    const existingProfile = await BusinessProfile.findOne({
      seller: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Business profile already exists",
      });
    }

    // Extract data from request
    const {
      businessName,
      description,
      email,
      phone,
      whatsapp,
      address,
      city,
      businessHours,
      logo,
      coverImage,
    } = req.body;

    // Validate required fields
    if (
      !businessName ||
      !description ||
      !email ||
      !phone ||
      !address ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create profile object
    const profileData = {
      seller: req.user.id,
      businessName,
      description,
      email,
      phone,
      address,
      city,
    };

    // Add optional fields if provided
    if (whatsapp) profileData.whatsapp = whatsapp;
    if (logo) profileData.logo = logo;
    if (coverImage) profileData.coverImage = coverImage;
    if (businessHours) profileData.businessHours = businessHours;

    // Handle logo upload if file is provided
    if (req.files && req.files.logo) {
      const logoUpload = await uploadToCloudinary(req.files.logo[0]);
      profileData.logo = logoUpload.secure_url;
    }

    // Handle cover image upload if file is provided
    if (req.files && req.files.coverImage) {
      const coverUpload = await uploadToCloudinary(req.files.coverImage[0]);
      profileData.coverImage = coverUpload.secure_url;
    }

    // Save to database
    const profile = await BusinessProfile.create(profileData);

    // Update user's businessName if different
    if (req.user.businessName !== businessName) {
      await User.findByIdAndUpdate(req.user.id, { businessName });
    }

    res.status(201).json({
      success: true,
      data: profile,
      message: "Business profile created successfully",
    });
  } catch (error) {
    console.error("Create business profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating business profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Get current seller's business profile
 * @route   GET /api/seller/business-profile
 * @access  Private/Seller
 */
exports.getBusinessProfile = async (req, res) => {
  try {
    // Verify user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access business profiles",
      });
    }

    // Find profile for current user
    const profile = await BusinessProfile.findOne({ seller: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get business profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching business profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Update seller's business profile
 * @route   PUT /api/seller/business-profile
 * @access  Private/Seller
 */
exports.updateBusinessProfile = async (req, res) => {
  try {
    // Verify user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update business profiles",
      });
    }

    // Find existing profile
    const profile = await BusinessProfile.findOne({ seller: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found. Create one first.",
      });
    }

    // Extract data from request
    const {
      businessName,
      description,
      email,
      phone,
      whatsapp,
      address,
      city,
      businessHours,
    } = req.body;

    // Build update object
    const updateData = {};
    if (businessName) updateData.businessName = businessName;
    if (description) updateData.description = description;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (businessHours) updateData.businessHours = businessHours;

    // Handle logo upload if file is provided
    if (req.files && req.files.logo) {
      const logoUpload = await uploadToCloudinary(req.files.logo[0]);
      updateData.logo = logoUpload.secure_url;
    }

    // Handle cover image upload if file is provided
    if (req.files && req.files.coverImage) {
      const coverUpload = await uploadToCloudinary(req.files.coverImage[0]);
      updateData.coverImage = coverUpload.secure_url;
    }

    // Update profile
    const updatedProfile = await BusinessProfile.findOneAndUpdate(
      { seller: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Update user's businessName if provided and different
    if (businessName && req.user.businessName !== businessName) {
      await User.findByIdAndUpdate(req.user.id, { businessName });
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: "Business profile updated successfully",
    });
  } catch (error) {
    console.error("Update business profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating business profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete seller's business profile
 * @route   DELETE /api/seller/business-profile
 * @access  Private/Seller
 */
exports.deleteBusinessProfile = async (req, res) => {
  try {
    // Verify user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can delete business profiles",
      });
    }

    // Find and delete profile
    const profile = await BusinessProfile.findOneAndDelete({
      seller: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    res.json({
      success: true,
      message: "Business profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete business profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting business profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Get public business profile by seller ID
 * @route   GET /api/seller/:id/business-profile
 * @access  Public
 */
exports.getPublicBusinessProfile = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Find profile for specified seller
    const profile = await BusinessProfile.findOne({
      seller: sellerId,
    }).populate("seller", "name businessName");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    // Return public fields only
    const publicProfile = {
      businessName: profile.businessName,
      description: profile.description,
      logo: profile.logo,
      coverImage: profile.coverImage,
      businessHours: profile.businessHours,
      seller: profile.seller,
    };

    res.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    console.error("Get public business profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching business profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Check if business profile exists
 * @route   GET /api/seller/business-profile/exists
 * @access  Private/Seller
 */
exports.checkBusinessProfileExists = async (req, res) => {
  try {
    // Verify user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can check business profiles",
      });
    }

    // Check if profile exists
    const profile = await BusinessProfile.exists({ seller: req.user.id });

    res.json({
      success: true,
      exists: !!profile,
    });
  } catch (error) {
    console.error("Check business profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking business profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Get business profile statistics
 * @route   GET /api/seller/business-profile/stats
 * @access  Private/Seller
 */
exports.getBusinessProfileStats = async (req, res) => {
  try {
    // Verify user is a seller
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access business statistics",
      });
    }

    // Get business profile
    const profile = await BusinessProfile.findOne({ seller: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    // Get statistics (this would typically involve querying other collections)
    // Here's a placeholder for demonstration purposes
    const stats = {
      profileViews: 0,
      productViews: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get business stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching business statistics",
      error: error.message,
    });
  }
};

module.exports = exports;
