require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const fixUserDatesProper = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Get all users
    const allUsers = await User.find().sort({ _id: 1 });
    console.log(`Found ${allUsers.length} users\n`);

    // Distribute users across the past 30 days
    const today = new Date();
    const updates = [];

    for (let i = 0; i < allUsers.length; i++) {
      const daysAgo = Math.floor(i / 3); // Spread users: 3 users per day
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(Math.random() * 24, Math.random() * 60, 0, 0);

      updates.push({
        updateOne: {
          filter: { _id: allUsers[i]._id },
          update: { $set: { createdAt: date } }
        }
      });
    }

    if (updates.length > 0) {
      const result = await User.bulkWrite(updates);
      console.log(`✅ Updated ${result.modifiedCount} users with proper dates\n`);

      // Show sample
      const samples = await User.find().select('username createdAt').limit(3);
      console.log("Sample users:");
      samples.forEach(u => {
        console.log(`  ${u.username}: ${u.createdAt.toISOString().split('T')[0]}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
};

fixUserDatesProper();
