// backend/src/models/Event.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    eventType: {
      type: String,
      required: [true, "Please specify the event type"],
      enum: {
        values: [
          "birthday",
          "wedding",
          "graduation",
          "babyShower",
          "houseWarming",
          "anniversary",
          "other", // Added 'other' for custom event types
        ],
        message: "Please select a valid event type",
      },
    },
    customEventType: {
      type: String,
      trim: true,
      maxlength: [50, "Custom event type cannot be more than 50 characters"],
      // This will be used when eventType is 'other'
    },
    eventDate: {
      type: Date,
      required: [true, "Please add an event date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an end date"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "private",
      required: true,
    },
    // Add a new field to track whether the initial contribution has been made
    initialContributionMade: {
      type: Boolean,
      default: false,
    },

    // Modify the status field to include "pending" status
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"], // Added "pending" status
      default: "pending", // Changed default from "active" to "pending"
    },

    // Add field to track who made the initial contribution
    initialContributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Add field to track initial contribution amount
    initialContributionAmount: {
      type: Number,
      default: 0,
    },
    accessCode: {
      type: String,
      // For providing access to private events with a code
    },
    // Add the shareableLink field definition here
    shareableLink: {
      type: String,
      default: function () {
        return crypto.randomBytes(8).toString("hex");
      },
    },
    invitedUsers: [
      {
        email: String,
        phoneNumber: String,
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
    image: {
      type: String,
    },
    targetAmount: {
      type: Number,
      required: [true, "Please add a target amount"],
    },
    currentAmount: {
      type: Number,
      default: 0,
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
          default: 1,
        },
        status: {
          type: String,
          enum: ["pending", "contributed", "completed"],
          default: "pending",
        },
      },
    ],
    contributions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contribution",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a virtual field for progress percentage
eventSchema.virtual("progressPercentage").get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(
    Math.round((this.currentAmount / this.targetAmount) * 100),
    100
  );
});

// Add index for efficient queries
eventSchema.index({ creator: 1, status: 1 });
eventSchema.index({ visibility: 1, status: 1 });
eventSchema.index({ eventDate: 1 });
// Change the shareableLink index to not be unique
eventSchema.index({ shareableLink: 1 }, { unique: false });

module.exports = mongoose.model("Event", eventSchema);
