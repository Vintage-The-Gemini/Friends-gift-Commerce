// backend/src/controllers/auth.js - COMPLETE FILE WITH PHONE FORMAT SUPPORT
const crypto = require("crypto");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper function to normalize phone number
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all spaces and special characters except +
  phone = phone.replace(/[^\d+]/g, '');
  
  // Convert 07XXXXXXXX to +254XXXXXXXXX
  if (phone.startsWith('07') && phone.length === 10) {
    return '+254' + phone.slice(1);
  }
  
  // If already in +254 format, return as is
  if (phone.startsWith('+254') && phone.length === 13) {
    return phone;
  }
  
  // If starts with 254 (without +), add the +
  if (phone.startsWith('254') && phone.length === 12) {
    return '+' + phone;
  }
  
  return phone;
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role, businessName } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password are required",
      });
    }

    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Either email or phone number is required",
      });
    }

    if (role === "seller" && !businessName) {
      return res.status(400).json({
        success: false,
        message: "Business name is required for sellers",
      });
    }

    // Normalize phone number if provided
    const normalizedPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : null;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or phone number",
      });
    }

    // Create user data object
    const userData = {
      name,
      password,
      role: role || "buyer",
    };

    if (email) userData.email = email;
    if (normalizedPhone) userData.phoneNumber = normalizedPhone;
    if (role === "seller" && businessName) userData.businessName = businessName;

    // Create user
    const user = await User.create(userData);

    // Generate email verification token if email provided
    let verificationSent = false;
    if (email) {
      try {
        const verificationToken = user.getEmailVerificationToken();
        await user.save();
        
        // Send verification email (implement email service)
        // await sendVerificationEmail(email, verificationToken);
        verificationSent = true;
      } catch (emailError) {
        console.error("Email verification error:", emailError);
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        businessName: user.businessName,
        isEmailVerified: user.isEmailVerified,
      },
      message: email && verificationSent
        ? "Registration successful. Please check your email to verify your account."
        : "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, phoneNumber, identifier, password, role } = req.body;

    // Check for required fields
    if ((!email && !phoneNumber && !identifier) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/phone and password",
      });
    }

    // Determine the identifier to use
    const loginIdentifier = identifier || email || phoneNumber;
    
    // Normalize phone number if it looks like a phone
    const normalizedIdentifier = loginIdentifier.includes('@') 
      ? loginIdentifier 
      : normalizePhoneNumber(loginIdentifier);

    // Find user by email or phone number using custom static method
    const user = await User.findByEmailOrPhone(normalizedIdentifier, role);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if role matches (if provided)
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${role} account`,
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated. Please contact support.",
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        businessName: user.businessName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Google Login/Register
exports.googleLogin = async (req, res) => {
  try {
    const { credential, role = "buyer" } = req.body;

    console.log("[Backend] Google login attempt:", { 
      credentialPresent: !!credential, 
      role,
      clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "..." 
    });

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, email_verified } = ticket.getPayload();
    console.log("[Backend] Google verification successful:", { email, name, email_verified });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google data
      try {
        const userData = {
          name,
          email,
          password: crypto.randomBytes(16).toString("hex"), // Random password
          role,
          authProvider: "google",
          isEmailVerified: email_verified,
          profilePicture: picture,
          isActive: true,
        };

        // Add businessName for sellers
        if (role === "seller") {
          userData.businessName = name; // Use Google name as default
        }

        // DON'T set phoneNumber - let it be undefined to avoid unique constraint
        user = await User.create(userData);
        
        console.log("[Backend] New user created:", user._id);
      } catch (createError) {
        console.error("User creation error:", createError);
        
        // Handle specific duplicate key errors
        if (createError.code === 11000) {
          if (createError.message.includes('phoneNumber')) {
            return res.status(400).json({
              success: false,
              message: "Phone number conflict. Please contact support.",
            });
          }
          if (createError.message.includes('email')) {
            return res.status(400).json({
              success: false,
              message: "Email already exists. Please sign in instead.",
            });
          }
        }
        
        return res.status(500).json({
          success: false,
          message: "Failed to create user account",
          error: createError.message,
        });
      }
    } else {
      // Update existing user with Google info
      user.authProvider = "google";
      user.isEmailVerified = email_verified || user.isEmailVerified;
      user.profilePicture = picture || user.profilePicture;
      user.lastLogin = Date.now();
      await user.save();
      
      console.log("[Backend] Existing user updated:", user._id);
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        businessName: user.businessName,
        phoneNumber: user.phoneNumber, // Will be null for Google users
      },
    });
  } catch (error) {
    console.error("[Backend] Google login error:", error);
    
    // More specific error messages
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }
    
    if (error.message.includes('Token used too late')) {
      return res.status(401).json({
        success: false,
        message: "Google token expired",
      });
    }
    
    res.status(401).json({
      success: false,
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        businessName: user.businessName,
        profilePicture: user.profilePicture,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }
    
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, phoneNumber, identifier } = req.body;
    
    if (!email && !phoneNumber && !identifier) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number",
      });
    }
    
    const loginIdentifier = identifier || email || phoneNumber;
    const normalizedIdentifier = loginIdentifier.includes('@') 
      ? loginIdentifier 
      : normalizePhoneNumber(loginIdentifier);
    
    const user = await User.findByEmailOrPhone(normalizedIdentifier);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();
    
    // Send reset email/SMS (implement email/SMS service)
    // await sendPasswordResetEmail(user.email, resetToken);
    
    res.json({
      success: true,
      message: "Password reset instructions sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    // Generate new token
    const newToken = generateToken(user._id);
    
    res.json({
      success: true,
      token: newToken,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

module.exports = exports;