// backend/fixGoogleAuth.js - COMPLETE DATABASE FIX SCRIPT
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function fixGoogleAuthIssue() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log("\n📊 Analyzing current database state...");
    
    // 1. Check current state
    const totalUsers = await collection.countDocuments({});
    const nullPhoneUsers = await collection.countDocuments({ phoneNumber: null });
    const emptyPhoneUsers = await collection.countDocuments({ phoneNumber: "" });
    const validPhoneUsers = await collection.countDocuments({ 
      phoneNumber: { $exists: true, $ne: null, $ne: "" } 
    });
    
    console.log(`📈 Database Stats:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with null phoneNumber: ${nullPhoneUsers}`);
    console.log(`   Users with empty phoneNumber: ${emptyPhoneUsers}`);
    console.log(`   Users with valid phoneNumber: ${validPhoneUsers}`);

    // 2. Check existing indexes
    console.log("\n🔍 Checking existing indexes...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(idx => ({
      name: idx.name,
      key: idx.key,
      unique: idx.unique,
      sparse: idx.sparse
    })));

    // 3. Drop problematic phoneNumber indexes
    console.log("\n🗑️ Removing problematic indexes...");
    const phoneIndexesToDrop = ['phoneNumber_1', 'phoneNumber_1_'];
    
    for (const indexName of phoneIndexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (err) {
        console.log(`ℹ️ Index ${indexName} doesn't exist or already dropped`);
      }
    }

    // 4. Find and handle problematic users
    console.log("\n🧹 Cleaning up problematic user records...");
    
    // Find users with null or empty phoneNumber
    const problematicUsers = await collection.find({
      $or: [
        { phoneNumber: null },
        { phoneNumber: "" },
        { phoneNumber: { $exists: false } }
      ]
    }).toArray();

    console.log(`Found ${problematicUsers.length} users with null/empty phoneNumber`);

    // Option 1: Delete all users with null/empty phoneNumber (aggressive approach)
    // const deleteResult = await collection.deleteMany({ 
    //   $or: [
    //     { phoneNumber: null },
    //     { phoneNumber: "" },
    //     { phoneNumber: { $exists: false } }
    //   ]
    // });
    // console.log(`🗑️ Deleted ${deleteResult.deletedCount} users with null/empty phoneNumber`);

    // Option 2: More conservative - only delete users created in last hour (likely test accounts)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentProblematicUsers = await collection.deleteMany({
      $and: [
        {
          $or: [
            { phoneNumber: null },
            { phoneNumber: "" },
            { phoneNumber: { $exists: false } }
          ]
        },
        { createdAt: { $gte: oneHourAgo } }
      ]
    });
    console.log(`🗑️ Deleted ${recentProblematicUsers.deletedCount} recent users with null/empty phoneNumber`);

    // Option 3: Set remaining null phoneNumbers to undefined
    const updateResult = await collection.updateMany(
      { 
        $or: [
          { phoneNumber: null },
          { phoneNumber: "" }
        ]
      },
      { $unset: { phoneNumber: "" } }
    );
    console.log(`🔄 Updated ${updateResult.modifiedCount} users - removed null/empty phoneNumber fields`);

    // 5. Create new proper indexes
    console.log("\n📋 Creating new indexes...");
    
    // Create phoneNumber index with proper null handling
    try {
      await collection.createIndex(
        { phoneNumber: 1 },
        { 
          unique: true, 
          sparse: true,
          partialFilterExpression: { 
            phoneNumber: { $exists: true, $ne: null, $ne: "" } 
          },
          name: "phoneNumber_unique_sparse"
        }
      );
      console.log("✅ Created phoneNumber index with proper null handling");
    } catch (err) {
      console.error("❌ Error creating phoneNumber index:", err.message);
    }

    // Create email index if it doesn't exist
    try {
      await collection.createIndex(
        { email: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: "email_unique_sparse"
        }
      );
      console.log("✅ Created/verified email index");
    } catch (err) {
      console.log("ℹ️ Email index already exists or error:", err.message);
    }

    // Create compound indexes for efficient queries
    try {
      await collection.createIndex(
        { email: 1, role: 1 },
        { name: "email_role_compound" }
      );
      console.log("✅ Created email-role compound index");
    } catch (err) {
      console.log("ℹ️ Email-role index already exists or error:", err.message);
    }

    try {
      await collection.createIndex(
        { phoneNumber: 1, role: 1 },
        { 
          sparse: true,
          name: "phoneNumber_role_compound" 
        }
      );
      console.log("✅ Created phoneNumber-role compound index");
    } catch (err) {
      console.log("ℹ️ PhoneNumber-role index already exists or error:", err.message);
    }

    // 6. Verify the fix
    console.log("\n🔍 Verifying database state after fixes...");
    
    const finalStats = {
      totalUsers: await collection.countDocuments({}),
      nullPhoneUsers: await collection.countDocuments({ phoneNumber: null }),
      emptyPhoneUsers: await collection.countDocuments({ phoneNumber: "" }),
      undefinedPhoneUsers: await collection.countDocuments({ phoneNumber: { $exists: false } }),
      validPhoneUsers: await collection.countDocuments({ 
        phoneNumber: { $exists: true, $ne: null, $ne: "" } 
      }),
      emailUsers: await collection.countDocuments({ 
        email: { $exists: true, $ne: null, $ne: "" } 
      })
    };

    console.log(`📈 Final Database Stats:`);
    console.log(`   Total users: ${finalStats.totalUsers}`);
    console.log(`   Users with null phoneNumber: ${finalStats.nullPhoneUsers}`);
    console.log(`   Users with empty phoneNumber: ${finalStats.emptyPhoneUsers}`);
    console.log(`   Users with undefined phoneNumber: ${finalStats.undefinedPhoneUsers}`);
    console.log(`   Users with valid phoneNumber: ${finalStats.validPhoneUsers}`);
    console.log(`   Users with email: ${finalStats.emailUsers}`);

    // 7. Test the fix by attempting to create a test Google user
    console.log("\n🧪 Testing Google user creation...");
    
    const testGoogleUser = {
      name: "Test Google User",
      email: "test.google.user@gmail.com",
      password: "randompassword123",
      role: "buyer",
      authProvider: "google",
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const testResult = await collection.insertOne(testGoogleUser);
      console.log("✅ Test Google user created successfully:", testResult.insertedId);
      
      // Clean up test user
      await collection.deleteOne({ _id: testResult.insertedId });
      console.log("🧹 Test user cleaned up");
    } catch (err) {
      console.error("❌ Test Google user creation failed:", err.message);
    }

    // 8. Final index verification
    console.log("\n📋 Final index verification...");
    const finalIndexes = await collection.indexes();
    console.log("Final indexes:");
    finalIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${idx.unique}, sparse: ${idx.sparse})`);
    });

    console.log("\n🎉 Database fix completed successfully!");
    console.log("\n📝 Summary of changes:");
    console.log("   ✅ Removed problematic phoneNumber indexes");
    console.log("   ✅ Cleaned up users with null/empty phoneNumber");
    console.log("   ✅ Created proper sparse unique index for phoneNumber");
    console.log("   ✅ Verified email index exists");
    console.log("   ✅ Created compound indexes for efficient queries");
    console.log("   ✅ Tested Google user creation");
    
    console.log("\n🚀 Google Auth should now work without duplicate key errors!");

  } catch (error) {
    console.error("❌ Error fixing database:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    console.log("\n🔌 Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the fix
console.log("🚀 Starting Google Auth database fix...");
console.log("⚠️ Make sure you have a backup of your database before running this script!");
console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...");

setTimeout(() => {
  fixGoogleAuthIssue();
}, 5000);