// src/middleware/checkBusinessProfile.js
const BusinessProfile = require('../models/BusinessProfile');

const checkBusinessProfile = async (req, res, next) => {
  try {
    // Skip check if not a seller
    if (req.user.role !== 'seller') {
      return next();
    }

    // Check if business profile exists
    const profile = await BusinessProfile.findOne({ seller: req.user.id });

    // If no profile and not on setup page, redirect
    if (!profile && !req.path.includes('/setup')) {
      return res.status(403).json({
        success: false,
        message: 'Please complete your business profile setup',
        requiresSetup: true
      });
    }

    // Add profile to request object
    req.businessProfile = profile;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkBusinessProfile;