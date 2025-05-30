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

// Compound index to ensure user can't add same product twice
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Instance methods
wishlistSchema.methods.isExpired = function() {
  // Check if product is still available
  return !this.product || !this.product.isActive || this.product.stock <= 0;
};

// Static methods
wishlistSchema.statics.isProductInWishlist = async function(userId, productId) {
  const item = await this.findOne({ user: userId, product: productId });
  return !!item;
};

wishlistSchema.statics.getWishlistCount = async function(userId) {
  return this.countDocuments({ user: userId });
};

wishlistSchema.statics.getUserWishlistValue = async function(userId) {
  const items = await this.find({ user: userId }).populate('product', 'price');
  return items.reduce((total, item) => total + (item.product?.price || 0), 0);
};

// Pre-save middleware
wishlistSchema.pre('save', function(next) {
  // Auto-set addedAt if not provided
  if (this.isNew && !this.addedAt) {
    this.addedAt = new Date();
  }
  next();
});

// Virtual for age
wishlistSchema.virtual('age').get(function() {
  return Date.now() - this.addedAt;
});

// Ensure virtual fields are serialized
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);