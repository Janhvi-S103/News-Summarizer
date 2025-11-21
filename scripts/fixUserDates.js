require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const addCreatedAtToUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all users without createdAt to have today's date
    const result = await User.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: new Date() } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with createdAt`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
};

addCreatedAtToUsers();
