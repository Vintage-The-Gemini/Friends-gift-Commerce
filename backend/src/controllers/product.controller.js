// src/controllers/product.controller.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadToCloudinary } = require("../utils/cloudinary");

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Files received:", req.files);

    // Check if required fields exist
    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.price ||
      !req.body.categoryId
    ) {
      console.log("Missing required fields:", {
        name: !!req.body.name,
        description: !!req.body.description,
        price: !!req.body.price,
        categoryId: !!req.body.categoryId,
      });
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate category
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // Handle image uploads with detailed logging
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          console.log("Processing file:", file.originalname);
          console.log("File details:", {
            fieldname: file.fieldname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
          });

          const result = await uploadToCloudinary(file);
          console.log("Cloudinary upload result:", result);
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Error uploading images",
            error: uploadError.message,
          });
        }
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // Create product
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.categoryId,
      stock: parseInt(req.body.stock) || 0,
      images: imageUrls,
      seller: req.user._id,
      characteristics: req.body.characteristics
        ? JSON.parse(req.body.characteristics)
        : {},
      tags: req.body.tags
        ? req.body.tags.split(",").map((tag) => tag.trim())
        : [],
    });

    // Populate category and seller information
    await product.populate("category", "name");
    await product.populate("seller", "name businessName");

    console.log("Product created successfully:", product);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products with filters
// @route   GET /api/products/list
// @access  Public
const getProducts = async (req, res) => {
  try {
    const query = {};

    // Add filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.seller) query.seller = req.query.seller;
    if (req.query.minPrice) query.price = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) {
      query.price = { ...query.price, $lte: Number(req.query.maxPrice) };
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Active products only for public
    if (!req.user || req.user.role !== "admin") {
      query.isActive = true;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("seller", "name businessName")
      .sort(req.query.sort || "-createdAt")
      .skip(startIndex)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/detail/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name characteristics")
      .populate("seller", "name businessName");

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file);
        newImageUrls.push(result.secure_url);
      }
      req.body.images = [...product.images, ...newImageUrls];
    }

    // Parse characteristics if provided
    if (req.body.characteristics) {
      req.body.characteristics = JSON.parse(req.body.characteristics);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name");

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    // Soft delete by marking as inactive
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { seller: req.user._id };

    // Add status filter if provided
    if (req.query.status) {
      query.isActive = req.query.status === "active";
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts, // Make sure this function exists in your controller
};
