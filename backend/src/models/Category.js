// models/Category.js
const mongoose = require("mongoose");

const characteristicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["text", "number", "boolean", "select", "multiselect", "color"],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: [
    {
      type: String,
      trim: true,
    },
  ],
  unit: String,
  validation: {
    min: Number,
    max: Number,
    pattern: String,
  },
});

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    path: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    level: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    icon: {
      type: String,
    },
    characteristics: [characteristicSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    metadata: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

// Update path when parent changes
categorySchema.pre("save", async function (next) {
  if (this.isModified("parent")) {
    if (!this.parent) {
      this.path = [this._id];
      this.level = 0;
    } else {
      const parent = await this.constructor.findById(this.parent);
      if (!parent) {
        throw new Error("Parent category not found");
      }
      this.path = [...parent.path, this._id];
      this.level = parent.level + 1;
    }
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
