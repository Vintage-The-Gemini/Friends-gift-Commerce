// backend/src/models/user.js - COMPLETE FILE WITH PHONE FORMAT OPTIONS
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    phoneNumber: {
      type: String,
      // Only required if email is not provided
      required: function () {
        return !this.email;
      },
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow null/undefined for email-only users
          // Allow both +254XXXXXXXXX and 07XXXXXXXX formats
          return /^(\+254[0-9]{9}|07[0-9]{8})$/.test(v);
        },
        message: "Please enter a valid Kenyan phone number (+254XXXXXXXXX or 07XXXXXXXX)"
      },
    },
    email: {
      type: String,
      // Only required if phone is not provided
      required: function () {
        return !this.phoneNumber;
      },
      unique: true,
      sparse: true, // Allow null for phone-only users
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ["buyer", "seller", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "buyer",
    },

    // Business Info (for sellers)
    businessName: {
      type: String,
      required: function () {
        return this.role === "seller";
      },
      trim: true,
      minlength: [2, "Business name must be at least 2 characters"],
      maxlength: [100, "Business name cannot be more than 100 characters"],
    },

    // Authentication and Verification
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },

    // Optional Profile Info
    profilePicture: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create proper index for phoneNumber that allows nulls but ensures uniqueness for non-null values
userSchema.index(
  { phoneNumber: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { 
      phoneNumber: { $exists: true, $ne: null, $ne: "" } 
    }
  }
);

// Create index for email
userSchema.index({ email: 1 }, { unique: true, sparse: true });

// Create compound index for login queries
userSchema.index({ email: 1, role: 1 });
userSchema.index({ phoneNumber: 1, role: 1 });

// Method to normalize phone number format
userSchema.methods.normalizePhoneNumber = function() {
  if (!this.phoneNumber) return null;
  
  // Convert 07XXXXXXXX to +254XXXXXXXXX
  if (this.phoneNumber.startsWith('07')) {
    return '+254' + this.phoneNumber.slice(1);
  }
  
  return this.phoneNumber;
};

// Pre-save middleware to normalize phone number
userSchema.pre('save', function(next) {
  if (this.phoneNumber && this.phoneNumber.startsWith('07')) {
    this.phoneNumber = '+254' + this.phoneNumber.slice(1);
  }
  next();
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Static method to find user by email or phone
userSchema.statics.findByEmailOrPhone = function(identifier, role = null) {
  const query = {
    $or: [
      { email: identifier },
      { phoneNumber: identifier },
      // Also check for 07 format if identifier starts with 07
      ...(identifier.startsWith('07') ? [{ phoneNumber: '+254' + identifier.slice(1) }] : [])
    ]
  };
  
  if (role) {
    query.role = role;
  }
  
  return this.findOne(query).select('+password');
};

module.exports = mongoose.model("User", userSchema);