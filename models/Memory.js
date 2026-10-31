// models/Memory.js
// Enhanced Memory Model for KnowBridge - Shared AI Memory Platform
// Supports both AI Vector Memory Engine features and backward-compatible CRUD operations.

const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema(
  {
    // Short headline or summary for quick scanning and AI citations
    title: {
      type: String,
      trim: true,
      default: function () {
        // Backward-compatibility: auto-generate title from content if omitted by older clients
        if (this.content) {
          return this.content.length > 50
            ? this.content.substring(0, 47).trim() + '...'
            : this.content;
        }
        return 'Untitled Memory';
      }
    },

    // Detailed context, decision rationale, or technical rule
    content: {
      type: String,
      required: [true, 'Memory content is required'],
      trim: true
    },

    // Standardized category enum for AI classification and retrieval
    category: {
      type: String,
      enum: [
        'technical_decision',
        'architecture_rule',
        'incident_resolution',
        'temporary_constraint',
        'general_knowledge'
      ],
      default: 'technical_decision'
    },

    // Kept for backward-compatibility with older requests that sent `type`
    type: {
      type: String,
      default: 'decision',
      trim: true
    },

    // Who or what originated this memory (e.g., "Rahul (Tech Lead)", "PR #104")
    source: {
      type: String,
      required: [true, 'Memory source or author is required'],
      default: 'manual',
      trim: true
    },

    // Team or project namespace for scoping memories
    workspace: {
      type: String,
      default: 'default',
      trim: true,
      index: true
    },

    // Lifecycle state of the memory
    status: {
      type: String,
      enum: ['active', 'deprecated', 'conflicted'],
      default: 'active',
      index: true
    },

    // Reference to a newer memory that superseded or replaced this one
    superseded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Memory',
      default: null
    },

    // References to conflicting memories identified during review
    conflicts_with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory'
      }
    ],

    // Optional tags for keyword search and filtering
    tags: [
      {
        type: String,
        trim: true
      }
    ],

    // Optional Expiry Date for Time-To-Live (TTL) auto-expiry
    // When expires_at passes, MongoDB Atlas will automatically clean it up.
    expires_at: {
      type: Date,
      default: null,
      index: {
        expireAfterSeconds: 0,
        sparse: true
      }
    },

    // 3072-dimensional vector embedding for semantic search
    embedding: {
      type: [Number],
      default: undefined,
      select: false // Excluded from standard queries for performance
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'memories' // Explicitly maps to 'memories' collection in MongoDB Atlas
  }
);

// Backward-compatibility hook: sync `type` and `category`
MemorySchema.pre('validate', function () {
  // If category is not explicitly set but type is provided, map type to valid category
  if (this.type && (!this.category || this.category === 'technical_decision')) {
    const typeMapping = {
      decision: 'technical_decision',
      constraint: 'temporary_constraint',
      solution: 'incident_resolution',
      rule: 'architecture_rule',
      general: 'general_knowledge'
    };
    if (typeMapping[this.type.toLowerCase()]) {
      this.category = typeMapping[this.type.toLowerCase()];
    }
  }

  // If category is provided, keep type synced
  if (this.category && !this.type) {
    this.type = this.category;
  }
});

// Helpful compound index for fast workspace + status queries
MemorySchema.index({ workspace: 1, status: 1 });

const Memory = mongoose.model('Memory', MemorySchema);

module.exports = Memory;
