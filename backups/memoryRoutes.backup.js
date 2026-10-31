// routes/memoryRoutes.js
// This file defines the API route endpoints and connects them to the controller functions.

const express = require('express');
const router = express.Router();

const {
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory
} = require('../controllers/memoryController');

// Routes mapped to /api/memories
router.route('/')
  .post(createMemory)   // 1. POST /api/memories - Add a new memory
  .get(getMemories);    // 2. GET /api/memories - Get all memories

// Routes mapped to /api/memories/:id
router.route('/:id')
  .get(getMemoryById)   // 3. GET /api/memories/:id - Get one memory by ID
  .put(updateMemory)    // 4. PUT /api/memories/:id - Update a memory
  .delete(deleteMemory);// 5. DELETE /api/memories/:id - Delete a memory

module.exports = router;
