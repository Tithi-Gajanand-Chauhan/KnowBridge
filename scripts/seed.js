require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Memory = require('../models/Memory');
const { saveMemory } = require('../services/memoryEngine');

const SAMPLE_MEMORIES = [
  {
    title: 'PostgreSQL Selected for Billing Ledger',
    content: 'We chose PostgreSQL over MongoDB specifically for the billing service ledger because we require ACID transactions and strict foreign key integrity across multi-currency accounts.',
    category: 'technical_decision',
    source: 'Rahul (Tech Lead)',
    workspace: 'default',
    tags: ['database', 'billing', 'transactions'],
    expires_at: null,
  },
  {
    title: 'Migrate from Firebase Auth to Custom JWT',
    content: 'The team decided to migrate from Firebase Auth to custom JWT tokens because Firebase lacks support for our multi-tenant role-based access control (RBAC).',
    category: 'technical_decision',
    source: 'Rahul (Tech Lead)',
    workspace: 'default',
    tags: ['auth', 'jwt', 'security'],
    expires_at: null,
  },
  {
    title: 'Redis Cluster Invalidation Rule',
    content: 'During cache invalidation, never issue FLUSHALL on the primary Redis cluster during peak hours (10 AM - 6 PM IST). Always use scan-and-delete with cursor batches of 500 to prevent event loop stalls.',
    category: 'architecture_rule',
    source: 'Priya (SRE Lead)',
    workspace: 'default',
    tags: ['redis', 'caching', 'performance'],
    expires_at: null,
  },
  {
    title: 'Q4 Code Freeze for Payment Gateways',
    content: 'Temporary production deployment freeze on the payment gateway and checkout microservices in preparation for Diwali traffic surge.',
    category: 'temporary_constraint',
    source: 'Engineering Manager',
    workspace: 'default',
    tags: ['deployment', 'freeze', 'payments'],
    // Sets expiry for 7 days in the future (demonstrates MongoDB TTL index)
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Incident Post-Mortem: Order Timeout Workaround',
    content: 'Resolved order timeout incident #402. Root cause was third-party SMS OTP webhook timeout. Fixed by making OTP delivery asynchronous via background bullmq queue with 3 retries and exponential backoff.',
    category: 'incident_resolution',
    source: 'Dev Team On-Call',
    workspace: 'default',
    tags: ['incident', 'webhooks', 'async'],
    expires_at: null,
  },
];

async function seedDatabase() {
  console.log('--- Seeding KnowBridge Production Sample Memories ---\n');

  try {
    await connectDB();

    console.log('Inserting 5 realistic engineering memories with vector embeddings...');
    for (const item of SAMPLE_MEMORIES) {
      // Check if memory with this title already exists to prevent duplicate seeds
      const existing = await Memory.findOne({ title: item.title, workspace: item.workspace });
      if (!existing) {
        const saved = await saveMemory(item);
        console.log(`✅ Seeded: "${saved.title}" [${saved.category}] by ${saved.source}`);
      } else {
        console.log(`ℹ️ Already exists: "${item.title}"`);
      }
    }

    const total = await Memory.countDocuments({ workspace: 'default' });
    console.log(`\n🎉 Seeding complete! Total active memories in 'default' workspace: ${total}`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
