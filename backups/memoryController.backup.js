// controllers/memoryController.js
// This file contains the logic for handling each API request related to Memories.

const mongoose = require('mongoose');
const Memory = require('../models/Memory');

// @desc    Add a new memory
// @route   POST /api/memories
// @access  Public
const createMemory = async (req, res, next) => {
  try {
    const { content, type, source, status } = req.body;

    // Validate required fields
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Content is required to create a memory.'
      });
    }

    // Create a new memory document in MongoDB
    const memory = await Memory.create({
      content,
      type,
      source,
      status
    });

    // 201 Created status indicates resource was successfully created
    return res.status(201).json({
      success: true,
      message: 'Memory created successfully!',
      data: memory
    });
  } catch (error) {
    // Pass any unexpected errors to the global error handler
    next(error);
  }
};

// @desc    Get all memories
// @route   GET /api/memories
// @access  Public
const getMemories = async (req, res, next) => {
  try {
    // Retrieve all memories from database, sorted by newest first
    const memories = await Memory.find().sort({ createdAt: -1 });

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

    // Validate if the ID matches MongoDB's 24-character hex format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    // Find document by its _id
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

    // Validate ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    // Find and update the memory
    // { new: true } returns the updated document instead of the old one
    // { runValidators: true } ensures schema validation rules are applied
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

    // Validate ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid memory ID format.'
      });
    }

    // Find and remove the document
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

module.exports = {
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory
};
