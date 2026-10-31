// config/db.js
// This file handles connecting our backend application to MongoDB Atlas using Mongoose.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if the user is still using the placeholder URI
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
      console.warn('⚠️  MongoDB Atlas URI is not configured yet in .env.');
      console.warn('👉 The server will start, but database operations (/api/memories) require a valid MongoDB Atlas connection.');
      return;
    }

    // Attempt to connect to MongoDB using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log a friendly message
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Make sure you have added your valid MongoDB Atlas connection string in the .env file and allowed IP access.');
  }
};

module.exports = connectDB;
