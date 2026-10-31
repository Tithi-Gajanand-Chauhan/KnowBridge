// models/Memory.js
// This file defines the Mongoose Schema and Model for storing Knowledge Memories.

const mongoose = require('mongoose');

// Define the blueprint for what a "Memory" looks like in the database
const memorySchema = new mongoose.Schema(
  {
    // The core knowledge, decision, constraint, or solution text
    content: {
      type: String,
      required: [true, 'Content is required for a memory'],
      trim: true
    },

    // Category of the memory (e.g., decision, constraint, solution, general)
    type: {
      type: String,
      default: 'decision',
      trim: true
    },

    // Where this memory came from (e.g., Slack, PR review, Architecture meeting, Docs)
    source: {
      type: String,
      default: 'manual',
      trim: true
    },

    // Current state of the memory (e.g., active, archived, deprecated)
    status: {
      type: String,
      default: 'active',
      trim: true
    }
  },
  {
    // Automatically creates and manages 'createdAt' and 'updatedAt' timestamps
    timestamps: true
  }
);

// Create and export the Memory model
// Mongoose creates a collection named "memories" (plural of Memory) in MongoDB
const Memory = mongoose.model('Memory', memorySchema);

module.exports = Memory;
