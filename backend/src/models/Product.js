// backend/src/models/Product.js (Updated with approval fields)
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
      default: function () {
        return this.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      },
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
    isActive: {
      type: Boolean,
      default: false, // Products are inactive by default until approved
    },
    tags: [String],
    viewCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // New approval system fields
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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

// Add text index for search
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

// Middleware to ensure unique slug
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingProduct = await this.constructor.findOne({
        slug,
        _id: { $ne: this._id },
      });

      if (!existingProduct) {
        this.slug = slug;
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  next();
});

// Add middleware for resubmitting a rejected product
productSchema.methods.resubmit = function (productData) {
  // Store the current version in previous versions
  if (this.approvalStatus === "rejected") {
    this.previousVersions.push({
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      images: this.images,
      characteristics: this.characteristics,
      rejectionReason: this.reviewNotes,
      rejectedAt: this.reviewedAt,
      rejectedBy: this.reviewedBy,
    });

    // Update product with new data
    Object.assign(this, productData);

    // Reset approval status
    this.approvalStatus = "pending";
    this.reviewedBy = undefined;
    this.reviewedAt = undefined;
    this.reviewNotes = undefined;

    // Update resubmission metadata
    this.resubmitted = true;
    this.resubmissionCount += 1;

    return true;
  }

  return false;
};

module.exports = mongoose.model("Product", productSchema);
