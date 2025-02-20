// controllers/event.controller.js
const Event = require("../models/Event");
const Product = require("../models/Product");
const { uploadToCloudinary } = require("../utils/cloudinary");

exports.createEvent = async (req, res) => {
  try {
    console.log("Received event creation request:", req.body);

    const {
      title,
      eventType,
      description,
      eventDate,
      products,
      targetAmount,
      visibility,
      endDate,
    } = req.body;

    // Validate required fields
    if (!title || !eventType || !eventDate || !targetAmount || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate date format and logic
    const eventDateObj = new Date(eventDate);
    const endDateObj = new Date(endDate);
    const now = new Date();

    if (isNaN(eventDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date format",
      });
    }

    if (isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date format",
      });
    }

    if (eventDateObj < now) {
      return res.status(400).json({
        success: false,
        message: "Event date cannot be in the past",
      });
    }

    if (endDateObj < eventDateObj) {
      return res.status(400).json({
        success: false,
        message: "End date must be after event date",
      });
    }

    // Validate and process products
    let validatedProducts = [];
    if (products) {
      try {
        const productsList = JSON.parse(products);
        console.log("Parsed products list:", productsList);

        for (const item of productsList) {
          const product = await Product.findById(item.product);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product ${item.product} not found`,
            });
          }

          // Validate quantity
          const quantity = parseInt(item.quantity) || 1;
          if (quantity < 1) {
            return res.status(400).json({
              success: false,
              message: "Product quantity must be at least 1",
            });
          }

          if (quantity > product.stock) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for product: ${product.name}`,
            });
          }

          validatedProducts.push({
            product: product._id,
            quantity: quantity,
            status: "pending",
          });
        }
      } catch (error) {
        console.error("Products parsing error:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
          error: error.message,
        });
      }
    }

    // Handle image upload if provided
    let imageUrl;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload event image",
        });
      }
    }

    // Validate target amount
    const parsedTargetAmount = parseFloat(targetAmount);
    if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid target amount",
      });
    }

    // Create event
    const event = await Event.create({
      title: title.trim(),
      creator: req.user._id,
      eventType,
      description: description.trim(),
      eventDate,
      products: validatedProducts,
      targetAmount: parsedTargetAmount,
      currentAmount: 0,
      visibility: visibility || "public",
      status: "active",
      endDate,
      image: imageUrl,
    });

    // Populate necessary fields
    await event.populate([
      { path: "creator", select: "name" },
      {
        path: "products.product",
        select: "name price images description",
      },
    ]);

    console.log("Event created successfully:", event);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create event",
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

    // Add event type filter
    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }

    // Add date filters
    if (req.query.startDate) {
      query.eventDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.endDate = { $lte: new Date(req.query.endDate) };
    }

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || "-createdAt";

    const events = await Event.find(query)
      .populate("creator", "name")
      .populate("products.product", "name price images")
      .sort(sortBy)
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
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
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
      .populate({
        path: "products.product",
        select: "name price images description stock",
      })
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
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
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

    // Handle image upload if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      req.body.image = result.secure_url;
    }

    // Handle products update
    if (req.body.products) {
      try {
        const productsList = JSON.parse(req.body.products);
        const validatedProducts = [];

        for (const item of productsList) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product ${item.productId} not found`,
            });
          }
          validatedProducts.push({
            product: product._id,
            quantity: parseInt(item.quantity) || 1,
            status: "pending",
          });
        }
        req.body.products = validatedProducts;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
        });
      }
    }

    // Update event
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
    console.error("Error updating event:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update event",
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

      return res.json({
        success: true,
        message: "Event has been cancelled",
      });
    } else {
      await event.deleteOne();

      return res.json({
        success: true,
        message: "Event deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};

// @desc    Get user's events
// @route   GET /api/events/my-events
// @access  Private
exports.getUserEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = { creator: req.user._id };

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Get events
    const events = await Event.find(query)
      .populate("creator", "name")
      .populate("products.product", "name price images")
      .populate({
        path: "contributions",
        populate: {
          path: "contributor",
          select: "name",
        },
      })
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    // Get total count
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
    console.error("Error fetching user events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user events",
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/:id/stats
// @access  Private
exports.getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check authorization
    if (
      event.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view event statistics",
      });
    }

    // Calculate statistics
    const stats = {
      totalContributions: event.contributions?.length || 0,
      totalAmount: event.currentAmount || 0,
      progress: event.targetAmount
        ? (event.currentAmount / event.targetAmount) * 100
        : 0,
      remainingAmount: event.targetAmount - (event.currentAmount || 0),
      daysLeft: Math.ceil(
        (new Date(event.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
      productStats: await Promise.all(
        event.products.map(async (product) => {
          const contributionsForProduct =
            event.contributions?.filter(
              (c) => c.product?.toString() === product.product.toString()
            ) || [];

          return {
            productId: product.product,
            quantity: product.quantity,
            totalContributions: contributionsForProduct.length,
            amountContributed: contributionsForProduct.reduce(
              (sum, c) => sum + (c.amount || 0),
              0
            ),
          };
        })
      ),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching event statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event statistics",
    });
  }
};

module.exports = exports;
