const mongoose = require('mongoose');

/**
 * Memory Schema for Persistent Team Knowledge
 * Aligned with MongoDB Agentic Memory Track guidelines
 */
const MemorySchema = new mongoose.Schema(
  {
    // Short headline or summary for quick scanning
    title: {
      type: String,
      trim: true,
      required: [true, 'Memory title is required'],
    },

    // Detailed context, decision rationale, or rule
    content: {
      type: String,
      required: [true, 'Memory content is required'],
      trim: true,
    },

    // Classification of the knowledge item
    category: {
      type: String,
      required: [true, 'Memory category is required'],
      enum: [
        'technical_decision',    // Architectural decisions (e.g. DB choices, framework migrations)
        'architecture_rule',     // Best practices & coding standards
        'incident_resolution',   // Post-mortems, bug resolutions, and system fixes
        'temporary_constraint',  // Sprint freezes, temporary bypasses, scheduled rules
        'general_knowledge',     // Domain-specific or onboarding context
      ],
      default: 'technical_decision',
    },

    // Who or what originated this memory (e.g., "Rahul (Tech Lead)", "PR #104", "On-call debrief")
    source: {
      type: String,
      required: [true, 'Memory source or author is required'],
      trim: true,
    },

    // Team or project namespace for scoping memories
    workspace: {
      type: String,
      default: 'default',
      trim: true,
      index: true,
    },

    // Lifecycle state of the memory
    status: {
      type: String,
      enum: ['active', 'deprecated', 'conflicted'],
      default: 'active',
      index: true,
    },

    // Reference to a newer memory that superseded or corrected this one
    superseded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Memory',
      default: null,
    },

    // References to conflicting memories identified during review
    conflicts_with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory',
      },
    ],

    // Optional tags for quick filtering
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Optional Expiry Date for Time-To-Live (TTL) auto-expiry
    // When expires_at is set to a past date, MongoDB will automatically clean it up.
    expires_at: {
      type: Date,
      default: null,
      index: {
        expireAfterSeconds: 0,
        sparse: true, // Only indexes documents where expires_at is present
      },
    },

    // Placeholder for vector embeddings (will be populated during Vector Search phase)
    embedding: {
      type: [Number],
      default: undefined,
      select: false, // Omit raw vector array by default in standard queries for efficiency
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
    collection: 'memories', // Explicitly maps to the 'memories' collection in MongoDB Atlas
  }
);

// Helpful compound index for workspace + status queries
MemorySchema.index({ workspace: 1, status: 1 });

const Memory = mongoose.model('Memory', MemorySchema);

module.exports = Memory;
