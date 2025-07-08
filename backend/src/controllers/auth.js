// backend/src/controllers/auth.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");
const crypto = require("crypto");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, phoneNumber, email, password, role, businessName } = req.body;

    // Check for required fields
    if ((!phoneNumber && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide either phone number or email, and password",
      });
    }

    // Validate role
    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either buyer or seller",
      });
    }

    // Check if user already exists with this phone or email
    let existingUser;
    if (phoneNumber) {
      existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this phone number already exists",
        });
      }
    }

    if (email) {
      existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists",
        });
      }
    }

    // Create user with initial values
    const userData = {
      name,
      password,
      role,
      authProvider: "local",
    };

    // Add optional fields if provided
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (email) userData.email = email;
    if (role === "seller" && businessName) userData.businessName = businessName;

    // Create the user
    const user = await User.create(userData);

    // If email provided, generate verification token and send email
    let verificationSent = false;
    if (email) {
      const verificationToken = user.generateVerificationToken();
      await user.save();

      // Send verification email
      verificationSent = await sendVerificationEmail(user, verificationToken);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
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
      },
      message: email
        ? verificationSent
          ? "Registration successful. Please check your email to verify your account."
          : "Registration successful, but verification email could not be sent."
        : "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
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
    const { email, phoneNumber, password, role } = req.body;

    // Check for required fields
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/phone and password",
      });
    }

    // Find user by email or phone number
    let user;
    if (email) {
      user = await User.findOne({ email }).select("+password");
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber }).select("+password");
    }

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
        user = await User.create({
          name,
          email,
          password: crypto.randomBytes(16).toString("hex"), // Random password
          role,
          authProvider: "google",
          isEmailVerified: email_verified,
          profilePicture: picture,
          isActive: true,
        });
        
        console.log("[Backend] New user created:", user._id);
      } catch (createError) {
        console.error("User creation error:", createError);
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
      },
    });
  } catch (error) {
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

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token
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

    // Update user
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

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phoneNumber', 'businessName'];
    const updates = {};
    
    // Only allow certain fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        businessName: user.businessName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: emailSent 
        ? "Verification email sent successfully"
        : "Verification email could not be sent, but token was generated",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: emailSent
        ? "Password reset email sent successfully"
        : "Password reset token generated, but email could not be sent",
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
    const { token, password } = req.body;

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    // Generate new JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
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