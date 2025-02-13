// src/config/db.js
const mongoose = require("mongoose");
const seedCategories = require("../utils/categorySeeder");

let seeded = false; // Flag to track if seeding has been done

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Only seed if explicitly enabled and hasn't been seeded yet
    if (process.env.SEED_CATEGORIES === "true" && !seeded) {
      try {
        await seedCategories();
        seeded = true; // Set flag to true after successful seeding
        console.log("Categories seeded successfully");
      } catch (seedError) {
        console.error("Error seeding categories:", seedError);
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
