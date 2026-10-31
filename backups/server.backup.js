// server.js
// Main entry point for the KnowBridge Express backend application.

// 1. Load environment variables from .env file before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const memoryRoutes = require('./routes/memoryRoutes');

// 2. Initialize the Express application
const app = express();

// Pretty-print JSON responses in the browser
app.set('json spaces', 2);

// 3. Connect to MongoDB Atlas
connectDB();

// 4. Global Middlewares
// Enable CORS so your frontend (e.g., React, Next.js) can communicate with this API
app.use(cors());

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// 5. Health Check Routes
// GET /api/health - Simple endpoint to verify the server is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KnowBridge backend is running'
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the KnowBridge API! 🚀',
    description: 'AI-powered shared memory platform for software development teams.',
    status: 'Running'
  });
});

// 6. Mount API Routes
app.use('/api/memories', memoryRoutes);

// 7. 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// 8. Global Error Handling Middleware
// Express catches any unhandled errors and directs them here
app.use((err, req, res, next) => {
  console.error('Error encountered:', err.message);

  // Handle Mongoose validation errors (e.g., missing required fields)
  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: errorMessages.join(', ')
    });
  }

  // Handle invalid Mongoose ObjectId casting errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Resource not found. Invalid ID format: ${err.value}`
    });
  }

  // Default server error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 9. Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KnowBridge Server running on http://localhost:${PORT}`);
});
