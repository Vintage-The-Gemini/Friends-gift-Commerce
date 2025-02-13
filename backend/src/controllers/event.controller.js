// controllers/event.controller.js
const Event = require("../models/Event");
const Product = require("../models/Product");
const { uploadToCloudinary } = require("../utils/cloudinary");

// @desc    Create event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      eventType,
      description,
      eventDate,
      products,
      targetAmount,
      visibility,
      endDate,
      theme,
    } = req.body;

    // Validate required fields
    if (!title || !eventType || !eventDate || !targetAmount || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate products if provided
    let validatedProducts = [];
    if (products && products.length > 0) {
      try {
        const productsList = JSON.parse(products);
        for (const item of productsList) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product ${item.productId} not found`,
            });
          }
          validatedProducts.push({
            product: item.productId,
            quantity: item.quantity || 1,
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
        });
      }
    }

    // Handle image upload
    let imageUrl;
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      imageUrl = result.secure_url;
    }

    // Create event
    const event = await Event.create({
      title,
      creator: req.user._id,
      eventType,
      description,
      eventDate,
      products: validatedProducts,
      targetAmount,
      visibility,
      endDate,
      image: imageUrl,
      theme: theme ? JSON.parse(theme) : undefined,
    });

    await event.populate([
      { path: "creator", select: "name" },
      {
        path: "products.product",
        select: "name price images",
      },
    ]);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const query = { status: "active" };

    // Filter by visibility for non-creators
    if (!req.user) {
      query.visibility = "public";
    } else if (req.user.role !== "admin") {
      query.$or = [{ visibility: "public" }, { creator: req.user._id }];
    }

    // Add other filters
    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const events = await Event.find(query)
      .populate("creator", "name")
      .populate("products.product", "name price images")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public/Private based on visibility
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("creator", "name")
      .populate("products.product", "name price images description")
      .populate("contributions.contributor", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check visibility permissions
    if (
      event.visibility === "private" &&
      (!req.user ||
        (event.creator._id.toString() !== req.user._id.toString() &&
          req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this event",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership
    if (
      event.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    // Handle image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      req.body.image = result.secure_url;
    }

    // Handle products update
    if (req.body.products) {
      try {
        const productsList = JSON.parse(req.body.products);
        for (const item of productsList) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product ${item.productId} not found`,
            });
          }
        }
        req.body.products = productsList;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
        });
      }
    }

    // Parse theme if provided
    if (req.body.theme) {
      req.body.theme = JSON.parse(req.body.theme);
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "creator", select: "name" },
      { path: "products.product", select: "name price images" },
    ]);

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership
    if (
      event.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    // Only allow deletion if no contributions
    if (event.contributions && event.contributions.length > 0) {
      event.status = "cancelled";
      await event.save();
    } else {
      await event.remove();
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
