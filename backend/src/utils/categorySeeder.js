// utils/categorySeeder.js
const Category = require("../models/Category");

// Helper function to generate slug
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

const categories = [
  {
    name: "Electronics",
    characteristics: [
      {
        name: "brand",
        type: "select",
        required: true,
        options: ["Apple", "Samsung", "Sony", "LG", "HP", "Dell", "Lenovo"],
      },
      {
        name: "warranty",
        type: "number",
        required: true,
        unit: "months",
        validation: {
          min: 0,
          max: 60,
        },
      },
      {
        name: "condition",
        type: "select",
        required: true,
        options: ["New", "Refurbished", "Used"],
      },
      { name: "model", type: "text" },
      { name: "size", type: "text" },
    ],
    subcategories: [
      {
        name: "Smartphones",
        characteristics: [
          {
            name: "storage",
            type: "select",
            required: true,
            options: ["64GB", "128GB", "256GB", "512GB", "1TB"],
          },
          { name: "color", type: "color", required: true },
          {
            name: "screen_size",
            type: "number",
            required: true,
            unit: "inches",
            validation: { min: 4, max: 7 },
          },
        ],
      },
      {
        name: "Laptops",
        characteristics: [
          {
            name: "processor",
            type: "select",
            required: true,
            options: [
              "Intel i3",
              "Intel i5",
              "Intel i7",
              "Intel i9",
              "AMD Ryzen 3",
              "AMD Ryzen 5",
              "AMD Ryzen 7",
            ],
          },
          {
            name: "ram",
            type: "select",
            required: true,
            options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
          },
          {
            name: "storage_type",
            type: "select",
            required: true,
            options: ["HDD", "SSD", "Both"],
          },
        ],
      },
      {
        name: "Televisions",
        characteristics: [
          { name: "screen_size", type: "number", unit: "inches" },
          { name: "resolution", type: "text" },
        ],
      },
      {
        name: "Cameras",
        characteristics: [
          { name: "megapixels", type: "number" },
          { name: "lens_type", type: "text" },
        ],
      },
      {
        name: "Headphones",
        characteristics: [
          {
            name: "type",
            type: "select",
            options: ["Over-ear", "In-ear", "On-ear"],
          },
          { name: "wireless", type: "boolean" },
        ],
      },
      {
        name: "Gaming Consoles",
        characteristics: [
          { name: "generation", type: "text" },
          { name: "storage", type: "select", options: ["500GB", "1TB", "2TB"] },
        ],
      },
      {
        name: "Wearables",
        characteristics: [
          {
            name: "type",
            type: "select",
            options: ["Smartwatch", "Fitness Tracker"],
          },
          { name: "battery_life", type: "text" },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    characteristics: [
      { name: "brand", type: "text", required: true },
      { name: "material", type: "text", required: true },
      { name: "care_instructions", type: "text" },
    ],
    subcategories: [
      {
        name: "Men's Clothing",
        characteristics: [
          {
            name: "size",
            type: "select",
            required: true,
            options: ["XS", "S", "M", "L", "XL", "XXL"],
          },
          { name: "color", type: "color", required: true },
        ],
      },
      {
        name: "Women's Clothing",
        characteristics: [
          {
            name: "size",
            type: "select",
            required: true,
            options: ["XS", "S", "M", "L", "XL"],
          },
          { name: "color", type: "color", required: true },
        ],
      },
      {
        name: "Shoes",
        characteristics: [{ name: "shoe_size", type: "number" }],
      },
      { name: "Accessories" },
      { name: "Bags" },
      { name: "Jewelry" },
      { name: "Watches" },
    ],
  },
  {
    name: "Home & Living",
    characteristics: [
      { name: "material", type: "text", required: true },
      { name: "dimensions", type: "text", required: true },
    ],
    subcategories: [
      {
        name: "Furniture",
        characteristics: [
          { name: "assembly_required", type: "boolean", required: true },
          {
            name: "weight_capacity",
            type: "number",
            unit: "kg",
            validation: { min: 0, max: 500 },
          },
        ],
      },
      {
        name: "Home Decor",
        characteristics: [
          {
            name: "style",
            type: "select",
            options: [
              "Modern",
              "Traditional",
              "Contemporary",
              "Rustic",
              "Industrial",
            ],
          },
          { name: "color", type: "color", required: true },
        ],
      },
      {
        name: "Bedding",
        characteristics: [
          {
            name: "size",
            type: "select",
            options: ["Twin", "Full", "Queen", "King"],
          },
        ],
      },
      { name: "Kitchenware" },
      { name: "Storage" },
      { name: "Lighting" },
      { name: "Cleaning Supplies" },
    ],
  },
];

const seedCategories = async () => {
  try {
    // First clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    for (const category of categories) {
      const mainCategory = await Category.create({
        name: category.name,
        slug: generateSlug(category.name),
        characteristics: category.characteristics || [],
      });
      console.log(`Created main category: ${category.name}`);

      if (category.subcategories) {
        for (const subCategory of category.subcategories) {
          await Category.create({
            name: subCategory.name,
            slug: `${generateSlug(category.name)}-${generateSlug(
              subCategory.name
            )}`,
            parent: mainCategory._id,
            characteristics:
              subCategory.characteristics || category.characteristics || [],
          });
          console.log(`Created subcategory: ${subCategory.name}`);
        }
      }
    }
    console.log("Successfully seeded all categories");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
};

module.exports = seedCategories;
