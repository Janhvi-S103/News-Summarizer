require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const addCreatedAtToUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the User collection directly
    const usersCollection = mongoose.connection.collection('users');

    // Find users without createdAt using direct collection query
    const users = await usersCollection.find({ createdAt: { $exists: false } }).toArray();
    console.log(`Found ${users.length} users without createdAt`);

    // Distribute users across the last 30 days (MOST recent first)
    for (let i = 0; i < users.length; i++) {
      const daysAgo = Math.floor((users.length - 1 - i) / 2); // Start from today, go backwards
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

      // Use direct MongoDB update
      const result = await usersCollection.updateOne(
        { _id: users[i]._id },
        { $set: { createdAt: date } }
      );
      
      console.log(`✅ ${users[i].username} -> ${date.toISOString().split('T')[0]}`);
    }

    // Verify the update
    const updatedUsers = await usersCollection.find({ createdAt: { $exists: true } }).toArray();
    console.log(`\n✅ Total users with createdAt now: ${updatedUsers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
};

addCreatedAtToUsers();
