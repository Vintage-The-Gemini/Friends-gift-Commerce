// models/Event.js
const mongoose = require("mongoose");

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
        "other",
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
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        status: {
          type: String,
          enum: ["pending", "contributed", "purchased"],
          default: "pending",
        },
      },
    ],
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
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
        contributor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: Number,
        message: String,
        anonymous: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    endDate: {
      type: Date,
      required: true,
    },
    image: String,
    theme: {
      colors: {
        primary: String,
        secondary: String,
      },
      template: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate shareable link before saving
eventSchema.pre("save", function (next) {
  if (!this.shareableLink) {
    this.shareableLink = `${this._id}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  }
  next();
});

// Calculate current amount from contributions
eventSchema.pre("save", function (next) {
  if (this.contributions && this.contributions.length > 0) {
    this.currentAmount = this.contributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0
    );
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
