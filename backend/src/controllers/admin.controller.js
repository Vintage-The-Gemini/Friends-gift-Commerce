// backend/src/controllers/admin.controller.js
const User = require("../models/user");
const Event = require("../models/Event");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Contribution = require("../models/Contribution");
const BusinessProfile = require("../models/BusinessProfile");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};



exports.adminLogin = async (req, res) => {
  try {
    console.log("=== ADMIN LOGIN ATTEMPT ===");
    console.log("Request body:", {
      phoneNumber: req.body.phoneNumber,
      passwordProvided: !!req.body.password,
      role: req.body.role || "not specified",
    });

    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      console.log("Missing credentials");
      return res.status(400).json({
        success: false,
        message: "Please provide phone number and password",
      });
    }

    // Find admin user - explicitly check for admin role
    console.log("Searching for admin with phone:", phoneNumber);

    // First try exact match
    let admin = await User.findOne({ phoneNumber, role: "admin" });
    console.log("Exact match result:", admin ? "Found" : "Not Found");

    // Try alternate formats if not found
    if (!admin) {
      // Try without + if it has one
      if (phoneNumber.startsWith("+")) {
        const altPhone = phoneNumber.substring(1);
        console.log("Trying alternate format without +:", altPhone);
        admin = await User.findOne({ phoneNumber: altPhone, role: "admin" });
        console.log("Alternate format result:", admin ? "Found" : "Not Found");
      }
      // Try with + if it doesn't have one
      else {
        const altPhone = `+${phoneNumber}`;
        console.log("Trying alternate format with +:", altPhone);
        admin = await User.findOne({ phoneNumber: altPhone, role: "admin" });
        console.log("Alternate format result:", admin ? "Found" : "Not Found");
      }
    }

    if (!admin) {
      console.log("No admin user found with provided phone number");
      // Search without role constraint to see if user exists with different role
      const anyUser = await User.findOne({ phoneNumber });
      if (anyUser) {
        console.log("User exists but has role:", anyUser.role);
      }

      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Verify password
    console.log("Admin found, verifying password");

    // Log password details for debugging (REMOVE IN PRODUCTION)
    console.log(
      "Stored password hash:",
      admin.password.substring(0, 10) + "..."
    );

    const isMatch = await admin.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Generate token
    console.log("Login successful, generating token");
    // IMPORTANT: Make sure role is included in the token payload
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log("Admin login successful:", admin._id);

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};




// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Admin only
exports.getDashboardStats = async (req, res) => {
  try {
    // Gather comprehensive stats from all collections
    const stats = {
      // User stats
      totalUsers: await User.countDocuments({ role: "buyer" }),
      totalSellers: await User.countDocuments({ role: "seller" }),
      totalAdmins: await User.countDocuments({ role: "admin" }),
      newUsers: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),

      // Event stats
      totalEvents: await Event.countDocuments(),
      activeEvents: await Event.countDocuments({ status: "active" }),
      completedEvents: await Event.countDocuments({ status: "completed" }),
      cancelledEvents: await Event.countDocuments({ status: "cancelled" }),

      // Product stats
      totalProducts: await Product.countDocuments(),
      activeProducts: await Product.countDocuments({ isActive: true }),

      // Order stats
      totalOrders: await Order.countDocuments(),
      pendingOrders: await Order.countDocuments({ status: "pending" }),
      completedOrders: await Order.countDocuments({ status: "completed" }),

      // Contribution stats
      totalContributions: await Contribution.countDocuments(),
      contributionAmount: await Contribution.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((result) => result[0]?.total || 0),

      // Recent data
      recentUsers: await User.find()
        .sort("-createdAt")
        .limit(5)
        .select("name phoneNumber role createdAt"),

      recentEvents: await Event.find()
        .sort("-createdAt")
        .limit(5)
        .populate("creator", "name")
        .select("title eventType status targetAmount currentAmount"),

      recentOrders: await Order.find()
        .sort("-createdAt")
        .limit(5)
        .populate("buyer", "name")
        .populate("seller", "businessName")
        .select("status totalAmount createdAt"),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
exports.getUsers = async (req, res) => {
  try {
    // Handle query parameters for filtering and pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { phoneNumber: searchRegex },
        { businessName: searchRegex },
      ];
    }

    if (req.query.isActive === "true") {
      query.isActive = true;
    } else if (req.query.isActive === "false") {
      query.isActive = false;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin only
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get additional user data based on role
    let additionalData = {};

    if (user.role === "seller") {
      // Get business profile for sellers
      const businessProfile = await BusinessProfile.findOne({
        seller: user._id,
      });
      additionalData.businessProfile = businessProfile;

      // Get seller's products count
      additionalData.productsCount = await Product.countDocuments({
        seller: user._id,
      });

      // Get seller's orders
      additionalData.ordersCount = await Order.countDocuments({
        seller: user._id,
      });
    }

    if (user.role === "buyer") {
      // Get buyer's events
      additionalData.eventsCount = await Event.countDocuments({
        creator: user._id,
      });

      // Get buyer's contributions
      additionalData.contributionsCount = await Contribution.countDocuments({
        contributor: user._id,
      });

      // Get buyer's orders
      additionalData.ordersCount = await Order.countDocuments({
        buyer: user._id,
      });
    }

    res.json({
      success: true,
      data: {
        user,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Admin only
exports.createUser = async (req, res) => {
  try {
    const { name, phoneNumber, password, role, businessName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone number",
      });
    }

    // Validate role
    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be buyer, seller, or admin",
      });
    }

    // Require business name for sellers
    if (role === "seller" && !businessName) {
      return res.status(400).json({
        success: false,
        message: "Business name is required for sellers",
      });
    }

    // Create user with admin as creator
    const userData = {
      name,
      phoneNumber,
      password,
      role,
      isActive: true,
      createdBy: req.user.id,
    };

    // Add business name for sellers
    if (role === "seller" && businessName) {
      userData.businessName = businessName;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        businessName: user.businessName,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin only
exports.updateUser = async (req, res) => {
  try {
    const { name, phoneNumber, role, businessName, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (role) user.role = role;
    if (businessName) user.businessName = businessName;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        businessName: user.businessName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// @desc    Delete/deactivate user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user",
        });
      }
    }

    // Instead of deleting, deactivate the user
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating user",
      error: error.message,
    });
  }
};

// @desc    Get all events
// @route   GET /api/admin/events
// @access  Admin only
exports.getEvents = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (req.query.creator) {
      query.creator = req.query.creator;
    }

    // Date filters
    if (req.query.startDate) {
      query.eventDate = { $gte: new Date(req.query.startDate) };
    }

    if (req.query.endDate) {
      query.endDate = { $lte: new Date(req.query.endDate) };
    }

    // Execute query with pagination
    const events = await Event.find(query)
      .populate("creator", "name phoneNumber")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/admin/events/:id
// @access  Admin only
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("creator", "name phoneNumber")
      .populate("products.product", "name price images")
      .populate("contributions", {
        path: "contributor",
        select: "name phoneNumber",
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get additional event data
    const contributionsCount = await Contribution.countDocuments({
      event: event._id,
    });
    const ordersCount = await Order.countDocuments({ event: event._id });

    res.json({
      success: true,
      data: {
        event,
        stats: {
          contributionsCount,
          ordersCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Admin only
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, status, visibility } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Update fields if provided
    if (title) event.title = title;
    if (description) event.description = description;
    if (status) event.status = status;
    if (visibility) event.visibility = visibility;

    await event.save();

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Admin only
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Instead of deleting, set status to cancelled
    event.status = "cancelled";
    await event.save();

    res.json({
      success: true,
      message: "Event cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling event:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling event",
      error: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Admin only
exports.getProducts = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (typeof req.query.isActive !== "undefined") {
      query.isActive = req.query.isActive === "true";
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (req.query.minPrice) {
      query.price = { $gte: parseFloat(req.query.minPrice) };
    }

    if (req.query.maxPrice) {
      if (query.price) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      } else {
        query.price = { $lte: parseFloat(req.query.maxPrice) };
      }
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate("seller", "name businessName")
      .populate("category", "name")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/admin/products/:id
// @access  Admin only
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name businessName phoneNumber")
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Admin only
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;
    if (typeof isActive !== "undefined") product.isActive = isActive;

    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// @desc    Delete/deactivate product
// @route   DELETE /api/admin/products/:id
// @access  Admin only
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Instead of deleting, deactivate the product
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: "Product deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating product:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating product",
      error: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin only
exports.getOrders = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    if (req.query.buyer) {
      query.buyer = req.query.buyer;
    }

    if (req.query.event) {
      query.event = req.query.event;
    }

    // Date range filters
    if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    }

    if (req.query.endDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(req.query.endDate);
      } else {
        query.createdAt = { $lte: new Date(req.query.endDate) };
      }
    }

    // Execute query with pagination
    const orders = await Order.find(query)
      .populate("buyer", "name phoneNumber")
      .populate("seller", "name businessName")
      .populate("event", "title eventType")
      .populate("products.product", "name price")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Admin only
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name phoneNumber")
      .populate("seller", "name businessName phoneNumber")
      .populate("event", "title eventType")
      .populate("products.product", "name price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// @desc    Update order
// @route   PUT /api/admin/orders/:id
// @access  Admin only
exports.updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, carrierName } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update fields if provided
    if (status) {
      order.status = status;
      order.orderProgress = status;

      // Add to timeline
      order.timeline.push({
        status,
        description: `Order status updated to ${status} by admin`,
        timestamp: new Date(),
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (carrierName) {
      order.carrierName = carrierName;
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Admin only
exports.getSellers = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Find all sellers
    const query = { role: "seller" };

    // Add active/inactive filter if provided
    if (req.query.isActive === "true") {
      query.isActive = true;
    } else if (req.query.isActive === "false") {
      query.isActive = false;
    }

    // Add search filter if provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { businessName: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    // Execute query with pagination
    const sellers = await User.find(query)
      .select("-password")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Fetch business profiles for the sellers
    const sellerIds = sellers.map((seller) => seller._id);
    const businessProfiles = await BusinessProfile.find({
      seller: { $in: sellerIds },
    });

    // Map business profiles to sellers
    const sellersWithProfiles = sellers.map((seller) => {
      const profile = businessProfiles.find(
        (profile) => profile.seller.toString() === seller._id.toString()
      );

      return {
        ...seller.toObject(),
        hasProfile: !!profile,
        businessProfile: profile || null,
      };
    });

    res.json({
      success: true,
      count: sellers.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      data: sellersWithProfiles,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sellers",
      error: error.message,
    });
  }
};

// @desc    Approve seller
// @route   PUT /api/admin/sellers/:id/approve
// @access  Admin only
exports.approveSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({
        success: false,
        message: "User is not a seller",
      });
    }

    // Activate the seller account
    seller.isActive = true;
    await seller.save();

    res.json({
      success: true,
      message: "Seller approved successfully",
      data: {
        id: seller._id,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        businessName: seller.businessName,
        isActive: seller.isActive,
      },
    });
  } catch (error) {
    console.error("Error approving seller:", error);
    res.status(500).json({
      success: false,
      message: "Error approving seller",
      error: error.message,
    });
  }
};

// @desc    Suspend seller
// @route   PUT /api/admin/sellers/:id/suspend
// @access  Admin only
exports.suspendSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({
        success: false,
        message: "User is not a seller",
      });
    }

    // Deactivate the seller account
    seller.isActive = false;
    await seller.save();

    res.json({
      success: true,
      message: "Seller suspended successfully",
      data: {
        id: seller._id,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        businessName: seller.businessName,
        isActive: seller.isActive,
      },
    });
  } catch (error) {
    console.error("Error suspending seller:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending seller",
      error: error.message,
    });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Admin only
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parent", "name")
      .sort("name");

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Admin only
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent, characteristics } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Create category
    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null,
      characteristics: characteristics || [],
    });

    // If parent exists, update the path and level
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (parentCategory) {
        category.path = [...parentCategory.path, category._id];
        category.level = parentCategory.level + 1;
        await category.save();
      }
    } else {
      // Root category
      category.path = [category._id];
      category.level = 0;
      await category.save();
    }

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Admin only
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, parent, characteristics, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update fields if provided
    if (name) {
      category.name = name;
      // Update slug when name changes
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    if (description !== undefined) category.description = description;
    if (characteristics) category.characteristics = characteristics;
    if (isActive !== undefined) category.isActive = isActive;

    // Handle parent change (this requires updating the path)
    if (parent !== undefined && parent !== category.parent?.toString()) {
      category.parent = parent || null;

      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (parentCategory) {
          category.path = [...parentCategory.path, category._id];
          category.level = parentCategory.level + 1;
        }
      } else {
        // Root category
        category.path = [category._id];
        category.level = 0;
      }
    }

    await category.save();

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Admin only
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has child categories
    const hasChildren = await Category.exists({ parent: category._id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with subcategories. Delete the subcategories first or reassign them.",
      });
    }

    // Check if category has products
    const hasProducts = await Product.exists({ category: category._id });
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with associated products. Remove or reassign the products first.",
      });
    }

    // Delete the category
    await category.remove();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

// @desc    Get all contributions
// @route   GET /api/admin/contributions
// @access  Admin only
exports.getContributions = async (req, res) => {
  try {
    // Handle query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    const query = {};

    if (req.query.event) {
      query.event = req.query.event;
    }

    if (req.query.contributor) {
      query.contributor = req.query.contributor;
    }

    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    // Date range filters
    if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    }

    if (req.query.endDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(req.query.endDate);
      } else {
        query.createdAt = { $lte: new Date(req.query.endDate) };
      }
    }

    // Min and max amount filters
    if (req.query.minAmount) {
      query.amount = { $gte: parseFloat(req.query.minAmount) };
    }

    if (req.query.maxAmount) {
      if (query.amount) {
        query.amount.$lte = parseFloat(req.query.maxAmount);
      } else {
        query.amount = { $lte: parseFloat(req.query.maxAmount) };
      }
    }

    // Execute query with pagination
    const contributions = await Contribution.find(query)
      .populate("contributor", "name phoneNumber")
      .populate("event", "title eventType")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Contribution.countDocuments(query);

    // Get total amount
    const totalAmount = await Contribution.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((result) => result[0]?.total || 0);

    res.json({
      success: true,
      count: contributions.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      totalAmount,
      data: contributions,
    });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contributions",
      error: error.message,
    });
  }
};
