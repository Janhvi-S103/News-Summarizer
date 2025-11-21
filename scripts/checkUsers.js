require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const users = await User.find().select('username createdAt updatedAt').limit(5);
    
    console.log("Sample users:");
    users.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`  createdAt: ${user.createdAt}`);
      console.log(`  updatedAt: ${user.updatedAt}`);
      console.log();
    });

    const totalUsers = await User.countDocuments();
    console.log(`Total users: ${totalUsers}`);

    const usersWithCreatedAt = await User.countDocuments({ createdAt: { $exists: true } });
    console.log(`Users with createdAt: ${usersWithCreatedAt}`);

    const usersWithoutCreatedAt = await User.countDocuments({ createdAt: { $exists: false } });
    console.log(`Users without createdAt: ${usersWithoutCreatedAt}`);

    process.exit(0);
  } catch (error) {
    console.error(`Error:`, error.message);
    process.exit(1);
  }
};

checkUsers();
