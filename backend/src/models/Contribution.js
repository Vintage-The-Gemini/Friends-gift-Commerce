// models/Contribution.js
const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["mpesa", "card", "paypal"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    mpesaDetails: {
      phoneNumber: String,
      transactionCode: String,
      responseCode: String,
      responseDescription: String,
    },
    cardDetails: {
      last4: String,
      brand: String,
      chargeId: String,
    },
    paypalDetails: {
      payerId: String,
      paymentId: String,
    },
    message: String,
    anonymous: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying
contributionSchema.index({ event: 1, paymentStatus: 1 });
contributionSchema.index({ contributor: 1, paymentStatus: 1 });

module.exports = mongoose.model("Contribution", contributionSchema);
