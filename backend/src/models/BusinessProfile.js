// backend/models/BusinessProfile.js
const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: String,
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
