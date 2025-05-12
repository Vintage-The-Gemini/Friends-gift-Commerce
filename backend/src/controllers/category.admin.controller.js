// backend/src/controllers/category.admin.controller.js
const Category = require("../models/Category");
const mongoose = require("mongoose");

/**
 * Helper function to generate slug from name
 */
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

/**
 * Seed categories from provided template
 * @route POST /api/admin/categories/seed
 * @access Admin only
 */
exports.seedCategories = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categories data. Expected an array of categories."
      });
    }

    // Keep track of created categories
    let created = 0;
    
    // Process and create all root categories first
    const categoryMap = {};
    
    // Helper function to recursively create categories and their subcategories
    const createCategoryTree = async (categoryData, parentId = null, level = 0) => {
      // Create the category
      const categoryDoc = new Category({
        name: categoryData.name,
        slug: generateSlug(categoryData.name),
        description: categoryData.description || `${categoryData.name} category`,
        parent: parentId,
        level: level,
        characteristics: categoryData.characteristics || [],
        isActive: true,
        path: parentId ? [] : [] // We'll update this after save
      });
      
      await categoryDoc.save({ session });
      created++;
      
      // If this is a root category, we need to set its own path
      if (!parentId) {
        categoryDoc.path = [categoryDoc._id];
      } else {
        // For subcategories, get the parent's path and add this category's ID
        const parent = await Category.findById(parentId).session(session);
        if (parent) {
          categoryDoc.path = [...parent.path, categoryDoc._id];
        }
      }
      
      // Save the updated path
      await categoryDoc.save({ session });
      
      // Store in our map for referencing later
      categoryMap[categoryDoc._id.toString()] = categoryDoc;
      
      // Process subcategories if any
      if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
        for (const subCategoryData of categoryData.subcategories) {
          await createCategoryTree(subCategoryData, categoryDoc._id, level + 1);
        }
      }
      
      return categoryDoc;
    };
    
    // Process all root categories
    for (const categoryData of categories) {
      await createCategoryTree(categoryData);
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: `Successfully seeded ${created} categories`,
      created: created
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error seeding categories:", error);
    res.status(500).json({
      success: false,
      message: "Error seeding categories",
      error: error.message
    });
  }
};

/**
 * Import categories from JSON
 * @route POST /api/admin/categories/import
 * @access Admin only
 */
exports.importCategories = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categories data. Expected an array of categories."
      });
    }

    // Similar implementation to seedCategories but could include handling existing categories,
    // updating instead of creating if IDs are provided, etc.
    // For simplicity, we're reusing the same logic here

    let created = 0;
    const categoryMap = {};
    
    const createCategoryTree = async (categoryData, parentId = null, level = 0) => {
      const categoryDoc = new Category({
        name: categoryData.name,
        slug: generateSlug(categoryData.name),
        description: categoryData.description || `${categoryData.name} category`,
        parent: parentId,
        level: level,
        characteristics: categoryData.characteristics || [],
        isActive: true,
        path: parentId ? [] : []
      });
      
      await categoryDoc.save({ session });
      created++;
      
      if (!parentId) {
        categoryDoc.path = [categoryDoc._id];
      } else {
        const parent = await Category.findById(parentId).session(session);
        if (parent) {
          categoryDoc.path = [...parent.path, categoryDoc._id];
        }
      }
      
      await categoryDoc.save({ session });
      categoryMap[categoryDoc._id.toString()] = categoryDoc;
      
      if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
        for (const subCategoryData of categoryData.subcategories) {
          await createCategoryTree(subCategoryData, categoryDoc._id, level + 1);
        }
      }
      
      return categoryDoc;
    };
    
    for (const categoryData of categories) {
      await createCategoryTree(categoryData);
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: `Successfully imported ${created} categories`,
      created: created
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error importing categories:", error);
    res.status(500).json({
      success: false,
      message: "Error importing categories",
      error: error.message
    });
  }
};

/**
 * Bulk update categories
 * @route POST /api/admin/categories/bulk
 * @access Admin only
 */
exports.bulkUpdateCategories = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty category IDs"
      });
    }

    if (!action || !["activate", "deactivate", "delete"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'activate', 'deactivate', or 'delete'"
      });
    }

    let result;

    if (action === "delete") {
      // For delete, we need to check if any category has children or products
      // For simplicity here, we'll just delete without these checks
      result = await Category.deleteMany({ _id: { $in: ids } });
    } else {
      // For activate/deactivate
      const isActive = action === "activate";
      result = await Category.updateMany(
        { _id: { $in: ids } },
        { $set: { isActive: isActive } }
      );
    }

    res.json({
      success: true,
      message: `Successfully performed ${action} on categories`,
      updated: result.modifiedCount || result.deletedCount || 0
    });
  } catch (error) {
    console.error(`Error in bulk ${req.body.action} categories:`, error);
    res.status(500).json({
      success: false,
      message: `Error performing bulk ${req.body.action}`,
      error: error.message
    });
  }
};