// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
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
    images: [
      {
        url: String,
        public_id: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
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
      default: true,
    },
    tags: [String],
    viewCount: {
      type: Number,
      default: 0,
    },
    viewHistory: [
      {
        userId: String,
        timestamp: Date,
      },
    ],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
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

module.exports = mongoose.model("Product", productSchema);
