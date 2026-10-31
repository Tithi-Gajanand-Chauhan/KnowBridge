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

/**
 * Connect to MongoDB Atlas using Mongoose
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in your environment variables (.env)');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'knowbridge', // Explicitly connects to the knowbridge database
    });

    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB Atlas] Active database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
    throw error;
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Atlas] Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Atlas] Runtime connection error:', err);
});

module.exports = connectDB;
