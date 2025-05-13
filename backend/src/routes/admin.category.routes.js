// routes/admin.category.routes.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parent", "name")
      .sort("order level");

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("parent", "name")
      .populate("path", "name slug");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
router.post("/", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has children
    const hasChildren = await Category.exists({ parent: category._id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with subcategories",
      });
    }

    await category.remove();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Seed categories
// @route   POST /api/admin/categories/seed
// @access  Private/Admin
router.post("/seed", async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Categories must be provided as an array",
      });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each root category
    for (const categoryData of categories) {
      try {
        // Create the root category
        const rootCategory = await Category.create({
          name: categoryData.name,
          description: categoryData.description || "",
          slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          characteristics: categoryData.characteristics || [],
          isActive: true,
        });
        
        createdCount++;

        // Process subcategories if any
        if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
          for (const subCategoryData of categoryData.subcategories) {
            try {
              await Category.create({
                name: subCategoryData.name,
                description: subCategoryData.description || "",
                slug: `${rootCategory.slug}-${subCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                parent: rootCategory._id,
                characteristics: subCategoryData.characteristics || categoryData.characteristics || [],
                isActive: true,
              });
              
              createdCount++;
            } catch (subCatError) {
              console.error(`Error creating subcategory ${subCategoryData.name}:`, subCatError);
              errorCount++;
            }
          }
        }
      } catch (catError) {
        console.error(`Error creating category ${categoryData.name}:`, catError);
        errorCount++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Categories seeded successfully. Created: ${createdCount}, Errors: ${errorCount}`,
      created: createdCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("Error seeding categories:", error);
    res.status(500).json({
      success: false,
      message: "Error seeding categories",
      error: error.message,
    });
  }
});

// @desc    Import categories
// @route   POST /api/admin/categories/import
// @access  Private/Admin
router.post("/import", async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Categories must be provided as an array",
      });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each category
    for (const categoryData of categories) {
      try {
        const category = await Category.create(categoryData);
        createdCount++;
      } catch (error) {
        console.error(`Error importing category ${categoryData.name}:`, error);
        errorCount++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Categories imported successfully. Created: ${createdCount}, Errors: ${errorCount}`,
      created: createdCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("Error importing categories:", error);
    res.status(500).json({
      success: false,
      message: "Error importing categories",
      error: error.message,
    });
  }
});

// @desc    Export categories
// @route   GET /api/admin/categories/export
// @access  Private/Admin
router.get("/export", async (req, res) => {
  try {
    const categories = await Category.find().sort("name");

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error exporting categories:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting categories",
      error: error.message,
    });
  }
});

module.exports = router;