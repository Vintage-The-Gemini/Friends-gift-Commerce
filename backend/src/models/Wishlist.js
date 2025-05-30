// backend/src/models/Wishlist.js
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
}, {
  timestamps: true,
});

// Compound index to ensure a user can't add the same product twice
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual for checking if item is available
wishlistSchema.virtual("isAvailable").get(function() {
  return this.product && this.product.stock > 0 && this.product.isActive;
});

// Instance methods
wishlistSchema.methods.updatePriority = function(priority) {
  this.priority = priority;
  return this.save();
};

// Static methods
wishlistSchema.statics.getUserWishlistCount = async function(userId) {
  return this.countDocuments({ user: userId });
};

wishlistSchema.statics.isProductInWishlist = async function(userId, productId) {
  const item = await this.findOne({ user: userId, product: productId });
  return !!item;
};

module.exports = mongoose.model("Wishlist", wishlistSchema);