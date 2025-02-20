// models/Event.js
const mongoose = require("mongoose");

const productReferenceSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["pending", "contributed", "purchased"],
    default: "pending",
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    creator: {
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
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    products: [productReferenceSchema],
    targetAmount: {
      type: Number,
      required: true,
      min: [0, "Target amount cannot be negative"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "active",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    shareableLink: {
      type: String,
      unique: true,
    },
    contributions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contribution",
      },
    ],
    endDate: {
      type: Date,
      required: true,
    },
    image: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for contribution stats
eventSchema.virtual("contributionStats").get(function () {
  return {
    totalContributions: this.contributions?.length || 0,
    progress: this.currentAmount
      ? (this.currentAmount / this.targetAmount) * 100
      : 0,
  };
});

// Generate shareable link before saving
eventSchema.pre("save", function (next) {
  if (!this.shareableLink) {
    this.shareableLink = `${this._id}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
