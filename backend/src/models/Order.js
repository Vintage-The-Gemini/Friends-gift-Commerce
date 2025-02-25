// src/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        status: {
          type: String,
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    orderProgress: {
      type: String,
      enum: [
        "pending",
        "processing",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    timeline: [
      {
        status: {
          type: String,
          enum: [
            "pending",
            "processing",
            "preparing",
            "shipped",
            "delivered",
            "cancelled",
          ],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shippingDetails: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: "Kenya",
      },
      phone: {
        type: String,
        required: true,
      },
      notes: String,
    },
    trackingNumber: String,
    carrierName: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "birthday",
        "wedding",
        "graduation",
        "babyShower",
        "houseWarming",
        "anniversary",
      ],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["mpesa", "card", "bank"],
      },
      transactionId: String,
      paidAmount: Number,
      paidAt: Date,
      currency: {
        type: String,
        default: "KES",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index for better query performance
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ event: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age
orderSchema.virtual("orderAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to ensure timeline is maintained
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.timeline.push({
      status: this.status,
      description: `Order status changed to ${this.status}`,
      timestamp: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
