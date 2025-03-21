// backend/src/models/Product.js

const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [imageSchema],
    stock: {
      type: Number,
      required: [true, "Product stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    characteristics: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    // Approval system fields - this is the key change
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: false, // Products are inactive by default until approved
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
    },

    // Fields for rejected products resubmission
    previousVersions: [
      {
        name: String,
        description: String,
        price: Number,
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        images: [imageSchema],
        characteristics: Map,
        rejectionReason: String,
        rejectedAt: Date,
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    resubmitted: {
      type: Boolean,
      default: false,
    },
    resubmissionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
