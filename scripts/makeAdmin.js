require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const makeUserAdmin = async (username) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOneAndUpdate(
      { username },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.log(`User "${username}" not found`);
      process.exit(1);
    }

    console.log(`✅ User "${username}" is now an admin!`);
    console.log(`Role: ${user.role}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
};

const username = process.argv[2];
if (!username) {
  console.log("Usage: node scripts/makeAdmin.js <username>");
  console.log("Example: node scripts/makeAdmin.js john.1");
  process.exit(1);
}

makeUserAdmin(username);
