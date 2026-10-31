// controllers/memoryController.js
// Handles all CRUD and AI-powered memory operations for KnowBridge.

const mongoose = require('mongoose');
const Memory = require('../models/Memory');
const memoryEngine = require('../services/memoryEngine');

// ==========================================
// 1. STANDARD CRUD OPERATIONS
// ==========================================

// @desc    Add a new memory
// @route   POST /api/memories
// @access  Public
const createMemory = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category,
      type,
      source,
      status,
      workspace,
      tags,
      expires_at
    } = req.body;

    // Validate required content field
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Content is required to create a memory.'
      });
    }

    // Create a new memory document in MongoDB Atlas
    const memory = await Memory.create({
      title,
      content,
      category,
      type,
      source,
      status,
      workspace,
      tags,
      expires_at
    });

    return res.status(201).json({
      success: true,
      message: 'Memory created successfully!',
      data: memory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all memories (supports optional workspace and status filters)
// @route   GET /api/memories
// @access  Public
const getMemories = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.workspace) filter.workspace = req.query.workspace;
    if (req.query.status) filter.status = req.query.status;

    // Retrieve memories from MongoDB Atlas, sorted by newest first
    const memories = await Memory.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: memories.length,
      data: memories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get one memory by ID
// @route   GET /api/memories/:id
// @access  Public
const getMemoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    const memory = await Memory.findById(id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: `Memory not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: memory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a memory by ID
// @route   PUT /api/memories/:id
// @access  Public
const updateMemory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    const updatedMemory = await Memory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedMemory) {
      return res.status(404).json({
        success: false,
        message: `Memory not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Memory updated successfully!',
      data: updatedMemory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a memory by ID
// @route   DELETE /api/memories/:id
// @access  Public
const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    const deletedMemory = await Memory.findByIdAndDelete(id);

    if (!deletedMemory) {
      return res.status(404).json({
        success: false,
        message: `Memory not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Memory deleted successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. AI MEMORY ENGINE OPERATIONS
// ==========================================

// @desc    Extract technical decisions & rules from conversation/meeting notes
// @route   POST /api/memories/extract
// @access  Public
const extractMemoriesHandler = async (req, res, next) => {
  try {
    const { text, source } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversation text in the "text" field to extract memories.'
      });
    }

    const extracted = await memoryEngine.extractMemories(text, source || 'Team Member');

    return res.status(200).json({
      success: true,
      count: extracted.length,
      data: extracted
    });
  } catch (error) {
    console.error('[AI Extract Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract memories from text.'
    });
  }
};

// @desc    Check if a candidate decision contradicts existing active memories
// @route   POST /api/memories/check-conflict
// @access  Public
const checkConflictHandler = async (req, res, next) => {
  try {
    const { title, content, workspace } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide "content" for the memory to check for conflicts.'
      });
    }

    const conflictResult = await memoryEngine.detectConflict(
      { title: title || '', content },
      workspace || 'default'
    );

    return res.status(200).json({
      success: true,
      data: conflictResult
    });
  } catch (error) {
    console.error('[AI Conflict Check Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to check for memory conflicts.'
    });
  }
};

// @desc    Supersede an older decision with a new one (deprecates old, saves new, links them)
// @route   PUT /api/memories/:id/supersede
// @access  Public
const supersedeMemoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    const newMemoryData = req.body;
    if (!newMemoryData || !newMemoryData.content || typeof newMemoryData.content !== 'string' || newMemoryData.content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Content is required for the new superseding memory.'
      });
    }

    const result = await memoryEngine.supersedeMemory(id, newMemoryData);

    return res.status(200).json({
      success: true,
      message: 'Memory superseded successfully!',
      data: result
    });
  } catch (error) {
    console.error('[AI Supersede Error]:', error.message);
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to supersede memory.'
    });
  }
};

// @desc    Context-aware Q&A grounded strictly in stored team memories
// @route   POST /api/chat (and POST /api/memories/chat)
// @access  Public
const chatHandler = async (req, res, next) => {
  try {
    const { question, workspace } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a "question" string in the request body.'
      });
    }

    const response = await memoryEngine.askQuestion(question, workspace || 'default');

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('[AI Chat Q&A Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process chat question.'
    });
  }
};

module.exports = {
  // CRUD
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
  // AI Engine
  extractMemoriesHandler,
  checkConflictHandler,
  supersedeMemoryHandler,
  chatHandler
};
