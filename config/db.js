// config/db.js
// Handles resilient connection to MongoDB Atlas for KnowBridge.
// Supports both MONGO_URI and MONGODB_URI, provides connection event logging,
// and preserves non-crashing startup if credentials are not yet configured.

const mongoose = require('mongoose');

const connectDB = async () => {
  // Support both environment variable naming conventions
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  // Graceful check: warn if missing or placeholder without crashing the server
  if (!uri || uri.includes('<username>')) {
    console.warn('⚠️  MongoDB connection URI is not configured yet in .env.');
    console.warn('👉 The server will start, but database operations (/api/memories) require a valid MongoDB Atlas connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'knowbridge', // Explicitly connects to the 'knowbridge' database
    });

    console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`✅ [MongoDB Atlas] Active database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // If the connection fails, log friendly instructions without crashing the process
    console.error(`❌ [MongoDB Atlas] Connection Error: ${error.message}`);
    console.error('👉 Make sure your MongoDB Atlas URI in .env is correct and your IP address is whitelisted in Atlas Network Access.');
  }
};

// Monitor connection events for observability
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  [MongoDB Atlas] Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB Atlas] Runtime connection error:', err.message || err);
});

module.exports = connectDB;
