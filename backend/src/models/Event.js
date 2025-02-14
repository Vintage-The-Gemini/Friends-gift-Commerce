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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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

// Create order when event is created
eventSchema.post("save", async function (doc) {
  if (!doc.order && doc.status === "active") {
    const Order = mongoose.model("Order");
    const totalAmount = doc.products.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const order = await Order.create({
      event: doc._id,
      products: doc.products.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      seller: doc.products[0].product.seller, // Assuming all products are from same seller
      buyer: doc.creator,
    });

    doc.order = order._id;
    await doc.save();
  }
});

module.exports = mongoose.model("Event", eventSchema);
