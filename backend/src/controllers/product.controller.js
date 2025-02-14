// controllers/product.controller.js
const Product = require("../models/Product");
const { uploadToCloudinary } = require("../utils/cloudinary");

// Update the createProduct function in product.controller.js

exports.createProduct = async (req, res) => {
  try {
    console.log("Creating product, request body:", req.body);

    // Upload images to Cloudinary
    const imageUploads = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file);
          imageUploads.push({
            url: result.secure_url,
            public_id: result.public_id,
            isPrimary: imageUploads.length === 0, // First image is primary
          });
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: "Error uploading images",
          });
        }
      }
    }

    // Generate slug from name
    const baseSlug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists and generate a unique one if needed
    let slug = baseSlug;
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
      const existingProduct = await Product.findOne({ slug });
      if (!existingProduct) {
        slugExists = false;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Create product with validated data
    const product = await Product.create({
      name: req.body.name,
      slug: slug,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.categoryId,
      seller: req.user._id,
      stock: parseInt(req.body.stock),
      images: imageUploads,
      characteristics: req.body.characteristics
        ? JSON.parse(req.body.characteristics)
        : {},
      isActive: true,
    });

    // Populate category and seller information
    await product.populate([
      { path: "category", select: "name" },
      { path: "seller", select: "name businessName" },
    ]);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};
exports.getProducts = async (req, res) => {
  try {
    const query = { isActive: true };

    // Apply filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.seller) query.seller = req.query.seller;
    if (req.query.minPrice)
      query.price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(req.query.maxPrice) };
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("seller", "name businessName")
      .sort(req.query.sort || "-createdAt")
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

exports.getSellerProducts = async (req, res) => {
  try {
    const query = { seller: req.user._id };

    // Add status filter if provided
    if (req.query.status) {
      query.isActive = req.query.status === "active";
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
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

// Add this to your product.controller.js

exports.updateProduct = async (req, res) => {
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

    // Handle image uploads
    const imageUploads = [...product.images]; // Keep existing images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file);
          imageUploads.push({
            url: result.secure_url,
            public_id: result.public_id,
            isPrimary: imageUploads.length === 0,
          });
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: "Error uploading images",
          });
        }
      }
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.categoryId,
      stock: parseInt(req.body.stock),
      images: imageUploads,
      characteristics: req.body.characteristics
        ? JSON.parse(req.body.characteristics)
        : product.characteristics,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      { path: "category", select: "name" },
      { path: "seller", select: "name businessName" },
    ]);

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// Add this to your product.controller.js

exports.deleteProduct = async (req, res) => {
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

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await deleteFromCloudinary(image.public_id);
      }
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};
