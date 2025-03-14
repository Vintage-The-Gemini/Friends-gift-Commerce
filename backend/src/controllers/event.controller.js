// backend/src/controllers/event.controller.js
const Event = require("../models/Event");
const Product = require("../models/Product");
const { uploadToCloudinary } = require("../utils/cloudinary");
const Order = require("../models/Order");
const crypto = require("crypto");

// Helper to generate access code for private events
const generateAccessCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

exports.createEvent = async (req, res) => {
  try {
    console.log("Creating event with data:", req.body);

    const {
      title,
      eventType,
      customEventType,
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

    // Validate dates
    const eventDateObj = new Date(eventDate);
    const endDateObj = new Date(endDate);
    const now = new Date();

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

    // Generate unique shareableLink - GUARANTEED to be set
    const shareableLink = crypto.randomBytes(8).toString("hex");
    console.log("Generated shareableLink:", shareableLink);

    // Process products if provided
    let productData = [];
    if (products) {
      try {
        const productsList = JSON.parse(products);
        for (const item of productsList) {
          productData.push({
            product: item.product,
            quantity: parseInt(item.quantity) || 1,
            status: "pending",
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
          error: error.message,
        });
      }
    }

    // Create event object explicitly with all fields
    const eventObj = {
      title: title.trim(),
      creator: req.user._id,
      eventType,
      description: description.trim(),
      eventDate,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      visibility: visibility || "public",
      status: "active",
      endDate,
      image: imageUrl,
      products: productData,
      shareableLink: shareableLink, // Explicitly set
    };

    // Generate access code for private/unlisted events
    if (visibility === "private" || visibility === "unlisted") {
      eventObj.accessCode = generateAccessCode();
    }

    // Handle custom event type
    if (eventType === "other" && customEventType) {
      eventObj.customEventType = customEventType.trim();
    }

    console.log(
      "Final event object being saved:",
      JSON.stringify(eventObj, null, 2)
    );

    // Create the event using direct object creation
    const event = await Event.create(eventObj);
    console.log("Event created with ID:", event._id);

    // Return the created event with populated fields
    const populatedEvent = await Event.findById(event._id)
      .populate("creator", "name")
      .populate("products.product", "name price images");

    res.status(201).json({
      success: true,
      data: {
        event: populatedEvent,
      },
    });
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// Fix 1: Update the getEvents function to properly handle visibility permissions
// Path: backend/src/controllers/event.controller.js

exports.getEvents = async (req, res) => {
  try {
    // Build query based on visibility and user
    const query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // If user is not logged in, only show public events
    if (!req.user) {
      query.visibility = "public";
    } else if (req.user.role !== "admin") {
      // For logged-in non-admin users, show:
      // 1. All public events
      // 2. Their own events (regardless of visibility)
      // 3. Private events where they're explicitly invited
      query.$or = [
        { visibility: "public" },
        { creator: req.user._id },
        { "invitedUsers.phoneNumber": req.user.phoneNumber },
        { "invitedUsers.email": req.user.email },
      ];
    }
    // Admin can see all events

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
      const searchOr = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];

      // Add $or to the existing query correctly
      if (query.$or) {
        // If we already have $or conditions, we need to use $and to combine them
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || "-createdAt";

    // Debug log
    console.log("Event query:", JSON.stringify(query));

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

// Fix 2: Update getUserEvents for better handling of private events
// Path: backend/src/controllers/event.controller.js

exports.getUserEvents = async (req, res) => {
  try {
    console.log("Getting events for user:", req.user._id);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query - show events created by the user
    const query = { creator: req.user._id };

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    console.log("Query:", query);

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
      .limit(limit)
      .lean(); // Use lean for better performance

    console.log(`Found ${events.length} events`);

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
      error: error.message,
    });
  }
};

// Fix 3: Improved getEvent function to properly handle private events
// Path: backend/src/controllers/event.controller.js

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
    if (event.visibility === "private") {
      // For private events, only creator, admin, or invited users can access
      const isCreator =
        req.user && event.creator._id.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === "admin";
      const isInvited =
        req.user &&
        event.invitedUsers &&
        event.invitedUsers.some(
          (user) =>
            (user.phoneNumber && user.phoneNumber === req.user.phoneNumber) ||
            (user.email && user.email === req.user.email)
        );
      const hasAccessCode =
        req.query.accessCode && req.query.accessCode === event.accessCode;

      if (!isCreator && !isAdmin && !isInvited && !hasAccessCode) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this private event",
          errorType: "accessDenied",
        });
      }
    } else if (event.visibility === "unlisted") {
      // For unlisted events, you need the direct link (with ID) or access code
      // Just having the ID is enough for unlisted events (that's the point of unlisted)
      // Additional access code check is optional
    }

    // If we've reached here, the user can access the event
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

// Fix 4: Enhance the updateEvent function for better error handling and to ensure only the creator can update
// Path: backend/src/controllers/event.controller.js

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

    // Extract data from request
    const {
      title,
      description,
      eventType,
      customEventType,
      eventDate,
      endDate,
      visibility,
      products,
    } = req.body;

    // Handle image upload if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      req.body.image = result.secure_url;
    }

    // Prepare update data
    const updateData = {
      ...req.body,
    };

    // Special handling for custom event type
    if (eventType === "other" && customEventType) {
      updateData.customEventType = customEventType.trim();
    } else if (eventType !== "other") {
      updateData.customEventType = undefined; // Clear if not needed
    }

    // Handle products update if provided
    if (products) {
      try {
        const productsList = JSON.parse(products);
        updateData.products = productsList.map((item) => ({
          product: item.product._id || item.product,
          quantity: parseInt(item.quantity) || 1,
          status: item.status || "pending",
        }));
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
          error: error.message,
        });
      }
    }

    // Update event
    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
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

// Fix 5: Improved deleteEvent function to handle contributions
// Path: backend/src/controllers/event.controller.js

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
        message:
          "Event has contributions and cannot be deleted. It has been cancelled instead.",
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

// Get events for the current user (my events)
exports.getUserEvents = async (req, res) => {
  try {
    console.log("Getting events for user:", req.user._id);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = { creator: req.user._id };

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    console.log("Query:", query);

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
      .limit(limit)
      .lean(); // Use lean for better performance

    console.log(`Found ${events.length} events`);

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
      error: error.message,
    });
  }
};

// Get invited events for the current user
exports.getInvitedEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Find events where user is invited
    const query = {
      status: "active",
      $or: [
        { "invitedUsers.phoneNumber": req.user.phoneNumber },
        { "invitedUsers.email": req.user.email },
      ],
    };

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
    console.error("Error fetching invited events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invited events",
      error: error.message,
    });
  }
};

// Get event by ID with access control
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
    if (event.visibility === "private") {
      // For private events, only creator, admin, or invited users can access
      const isCreator =
        req.user && event.creator._id.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === "admin";
      const isInvited =
        req.user &&
        event.invitedUsers.some(
          (user) =>
            user.phoneNumber === req.user.phoneNumber ||
            user.email === req.user.email
        );
      const hasAccessCode =
        req.query.accessCode && req.query.accessCode === event.accessCode;

      if (!isCreator && !isAdmin && !isInvited && !hasAccessCode) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this event",
        });
      }
    } else if (event.visibility === "unlisted") {
      // For unlisted events, you need the direct link (with ID) or access code
      const isCreator =
        req.user && event.creator._id.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === "admin";
      const hasAccessCode =
        req.query.accessCode && req.query.accessCode === event.accessCode;

      // Just having the ID is enough for unlisted events (that's the point of unlisted)
      // Additional access code check is optional
    }

    // If we've reached here, the user can access the event
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

// Invite users to a private event
exports.inviteUsers = async (req, res) => {
  try {
    const { invites } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is authorized to invite others
    if (
      event.creator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to invite users to this event",
      });
    }

    // Process invites - each invite should have email or phoneNumber
    if (!Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one user to invite",
      });
    }

    // Add new invites, avoid duplicates
    invites.forEach((invite) => {
      const { email, phoneNumber } = invite;

      // Check if already invited
      const alreadyInvited = event.invitedUsers.some(
        (user) =>
          (email && user.email === email) ||
          (phoneNumber && user.phoneNumber === phoneNumber)
      );

      if (!alreadyInvited) {
        event.invitedUsers.push({
          email,
          phoneNumber,
          status: "pending",
        });
      }
    });

    await event.save();

    res.json({
      success: true,
      message: "Invitations sent successfully",
    });
  } catch (error) {
    console.error("Error sending invites:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send invitations",
    });
  }
};

// Update an event
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

    // Extract data from request
    const {
      title,
      description,
      eventType,
      customEventType,
      eventDate,
      endDate,
      visibility,
      products,
    } = req.body;

    // Handle image upload if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      req.body.image = result.secure_url;
    }

    // Prepare update data
    const updateData = {
      ...req.body,
    };

    // Special handling for custom event type
    if (eventType === "other" && customEventType) {
      updateData.customEventType = customEventType.trim();
    } else if (eventType !== "other") {
      updateData.customEventType = undefined; // Clear if not needed
    }

    // Handle products update
    if (products) {
      try {
        const productsList = JSON.parse(products);
        const validatedProducts = [];

        for (const item of productsList) {
          const product = await Product.findById(
            item.productId || item.product
          );
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product ${item.productId || item.product} not found`,
            });
          }
          validatedProducts.push({
            product: product._id,
            quantity: parseInt(item.quantity) || 1,
            status: item.status || "pending",
          });
        }
        updateData.products = validatedProducts;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
          error: error.message,
        });
      }
    }

    // Update event
    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
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

// Delete event
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

// Additional controller functions for event.controller.js

exports.getPrivateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessCode } = req.query;

    if (!accessCode) {
      return res.status(400).json({
        success: false,
        message: "Access code is required for private events",
        errorType: "accessRequired",
      });
    }

    const event = await Event.findById(id)
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

    // Check if access code matches
    if (event.accessCode !== accessCode) {
      return res.status(403).json({
        success: false,
        message: "Invalid access code",
        errorType: "invalidAccessCode",
      });
    }

    // If we've reached here, the access code is valid
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error accessing private event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to access event",
    });
  }
};

exports.inviteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { invites } = req.body;

    if (!invites || !Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one user to invite",
      });
    }

    const event = await Event.findById(id);
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
        message: "Not authorized to invite users to this event",
      });
    }

    // Process invites
    const updatedInvites = [];
    for (const invite of invites) {
      // Check if email or phone number is already invited
      const existingInvite = event.invitedUsers?.find(
        (user) =>
          (invite.email && user.email === invite.email) ||
          (invite.phoneNumber && user.phoneNumber === invite.phoneNumber)
      );

      if (!existingInvite) {
        updatedInvites.push({
          email: invite.email,
          phoneNumber: invite.phoneNumber,
          name: invite.name || "",
          status: "pending",
        });
      }
    }

    // Initialize invitedUsers array if it doesn't exist
    if (!event.invitedUsers) {
      event.invitedUsers = [];
    }

    // Add new invites
    event.invitedUsers.push(...updatedInvites);
    await event.save();

    res.json({
      success: true,
      message: "Invitations sent successfully",
      data: {
        invitedUsers: event.invitedUsers,
      },
    });
  } catch (error) {
    console.error("Error sending invites:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send invitations",
    });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || !["accepted", "declined"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Invalid response. Must be 'accepted' or 'declined'",
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find the user's invitation
    const invitation = event.invitedUsers?.find(
      (user) =>
        (user.email && user.email === req.user.email) ||
        (user.phoneNumber && user.phoneNumber === req.user.phoneNumber)
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Update invitation status
    invitation.status = response;
    await event.save();

    res.json({
      success: true,
      message: `Invitation ${response} successfully`,
    });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to invitation",
    });
  }
};

exports.getEventContributions = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check visibility permissions for private events
    if (event.visibility === "private") {
      const isCreator =
        req.user && event.creator.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === "admin";
      const isInvited =
        req.user &&
        event.invitedUsers?.some(
          (user) =>
            (user.email && user.email === req.user.email) ||
            (user.phoneNumber && user.phoneNumber === req.user.phoneNumber)
        );

      if (
        !isCreator &&
        !isAdmin &&
        !isInvited &&
        req.query.accessCode !== event.accessCode
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this event's contributions",
        });
      }
    }

    // Fetch contributions
    const contributions = await Contribution.find({ event: id })
      .populate("contributor", "name")
      .sort("-createdAt");

    // Process contributions to respect anonymity
    const processedContributions = contributions.map((contribution) => {
      if (contribution.anonymous) {
        return {
          ...contribution.toObject(),
          contributor: { name: "Anonymous" },
        };
      }
      return contribution;
    });

    res.json({
      success: true,
      data: processedContributions,
    });
  } catch (error) {
    console.error("Error fetching event contributions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contributions",
    });
  }
};
module.exports = exports;
