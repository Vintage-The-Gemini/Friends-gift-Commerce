// src/controllers/business.controller.js
const BusinessProfile = require("../models/BusinessProfile");

// @desc    Create business profile
// @route   POST /api/seller/business-profile
// @access  Private/Seller
const createBusinessProfile = async (req, res) => {
  try {
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

    // Create new profile
    const profile = await BusinessProfile.create({
      seller: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Create business profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating business profile",
    });
  }
};

// Modify the getBusinessProfile function
const getBusinessProfile = async (req, res) => {
  try {
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
      message: error.message || "Error fetching business profile",
    });
  }
};

// @desc    Update business profile
// @route   PUT /api/seller/business-profile
// @access  Private/Seller
const updateBusinessProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOneAndUpdate(
      { seller: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

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
    console.error("Update business profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating business profile",
    });
  }
};

module.exports = {
  createBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile,
};
