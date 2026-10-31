// config/db.js
// Handles resilient connection to MongoDB Atlas for KnowBridge.
// Supports both MONGO_URI and MONGODB_URI, provides connection event logging,
// and includes DNS fallback to prevent querySrv ECONNREFUSED on local networks.

const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Configure public DNS resolvers (Google & Cloudflare) to prevent querySrv ECONNREFUSED
// which frequently occurs on campus/local ISP routers that block DNS SRV lookups.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // If setServers is restricted in the environment, continue with system defaults
}

const connectDB = async () => {
  // Support both environment variable naming conventions
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri || uri.includes('<username>')) {
    console.warn('⚠️  MongoDB connection URI is not configured yet in .env.');
    console.warn('👉 Please set MONGODB_URI in your .env file to connect to MongoDB Atlas.');
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
