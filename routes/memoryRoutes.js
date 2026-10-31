// routes/memoryRoutes.js
// Express Router for KnowBridge Memory APIs
// Handles standard CRUD routes and AI-powered memory operations.

const express = require('express');
const router = express.Router();

const {
  // Standard CRUD Handlers
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
  // AI Operations Handlers
  extractMemoriesHandler,
  checkConflictHandler,
  supersedeMemoryHandler,
  chatHandler
} = require('../controllers/memoryController');

// ==========================================
// 1. AI Memory Engine Endpoints
// (Defined BEFORE /:id to prevent routing collisions)
// ==========================================

// POST /api/memories/extract - Extract decisions from conversation/notes
router.post('/extract', extractMemoriesHandler);

// POST /api/memories/check-conflict - Detect contradictions before saving
router.post('/check-conflict', checkConflictHandler);

// POST /api/memories/chat - Direct chat endpoint alias within memory routes
router.post('/chat', chatHandler);

// ==========================================
// 2. Standard CRUD Collection Endpoints
// ==========================================

router.route('/')
  .post(createMemory)   // POST /api/memories - Add new memory
  .get(getMemories);    // GET /api/memories - Get all memories

// ==========================================
// 3. Supersede Memory Endpoint
// (Defined before generic /:id)
// ==========================================

// PUT /api/memories/:id/supersede - Deprecate old memory & link to new one
router.put('/:id/supersede', supersedeMemoryHandler);

// ==========================================
// 4. Parameterized ID Endpoints
// ==========================================

router.route('/:id')
  .get(getMemoryById)   // GET /api/memories/:id - Get one memory by ID
  .put(updateMemory)    // PUT /api/memories/:id - Update memory by ID
  .delete(deleteMemory);// DELETE /api/memories/:id - Delete memory by ID

module.exports = router;
