// Mock Data for KnowBridge — AI-Powered Persistent Team Memory Platform
// Grounded in UNCHARTED 2026 Track 1 (Agentic Memory) MongoDB + Gemini architecture

export const INITIAL_MEMORIES = [
  {
    _id: "mem_001",
    title: "PostgreSQL Selected for Billing Ledger",
    content: "We chose PostgreSQL over MongoDB specifically for the billing service ledger because we require ACID transactions and strict foreign key integrity across multi-currency accounts and customer subscription states.",
    category: "technical_decision",
    source: "Rahul (Tech Lead)",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["database", "billing", "transactions", "postgresql"],
    expires_at: null,
    score: 0.96,
    createdAt: "2026-10-24T10:30:00.000Z",
    updatedAt: "2026-10-24T10:30:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_002",
    title: "Migrate from Firebase Auth to Custom JWT",
    content: "The engineering team finalized migrating from Firebase Auth to custom RS256 JWT tokens with asymmetric signing. Firebase lacked native support for multi-tenant role-based access control (RBAC) and caused rate-limiting during enterprise SSO handshakes.",
    category: "technical_decision",
    source: "Rahul (Tech Lead)",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: ["mem_008"],
    tags: ["auth", "jwt", "security", "rbac"],
    expires_at: null,
    score: 0.94,
    createdAt: "2026-10-26T14:15:00.000Z",
    updatedAt: "2026-10-28T09:20:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_003",
    title: "Redis Cluster Invalidation Rule",
    content: "During cache invalidation, never issue FLUSHALL on the primary Redis cluster during peak hours (10 AM - 6 PM IST). Always use scan-and-delete with cursor batches of 500 to prevent Node.js event loop stalls and database connection spikes.",
    category: "architecture_rule",
    source: "Priya (SRE Lead)",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["redis", "caching", "performance", "sre"],
    expires_at: null,
    score: 0.92,
    createdAt: "2026-10-27T11:00:00.000Z",
    updatedAt: "2026-10-27T11:00:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_004",
    title: "Q4 Code Freeze for Payment Gateways",
    content: "Temporary production deployment freeze on the payment gateway, Stripe webhook handlers, and checkout microservices in preparation for high-concurrency Diwali traffic surge. Urgent hotfixes require VP approval.",
    category: "temporary_constraint",
    source: "Engineering Manager",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["deployment", "freeze", "payments", "ttl"],
    expires_at: "2026-11-07T23:59:59.000Z", // Active TTL
    score: 0.89,
    createdAt: "2026-10-31T08:00:00.000Z",
    updatedAt: "2026-10-31T08:00:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_005",
    title: "Incident Post-Mortem: Order Timeout Workaround",
    content: "Resolved order checkout timeout incident #402. Root cause was third-party SMS OTP webhook latency (>12s). Fixed by decoupling OTP delivery into asynchronous BullMQ queue with 3 retries and exponential backoff.",
    category: "incident_resolution",
    source: "Dev Team On-Call",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["incident", "webhooks", "async", "bullmq"],
    expires_at: null,
    score: 0.88,
    createdAt: "2026-10-28T16:40:00.000Z",
    updatedAt: "2026-10-28T16:40:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_006",
    title: "Zero Direct DB Access from Serverless Lambdas",
    content: "All AWS Lambda functions and background workers must query through the centralized Internal Data Gateway Service. Direct Mongoose connections from ephemeral Lambdas caused connection pool exhaustion on Atlas M30 cluster.",
    category: "architecture_rule",
    source: "Tithi (AI & Database Lead)",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["database", "serverless", "connection-pooling", "mongodb"],
    expires_at: null,
    score: 0.91,
    createdAt: "2026-10-29T13:10:00.000Z",
    updatedAt: "2026-10-29T13:10:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_007",
    title: "Standardized Tailwind & Design System Tokens",
    content: "UI components must strictly consume semantic Tailwind design tokens (brand, slate, subtle borders, card shadows). Custom inline styles or ad-hoc hex values in JSX are rejected in pull requests to preserve Notion/Linear aesthetic consistency.",
    category: "architecture_rule",
    source: "Soham (Frontend Lead)",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["frontend", "design-system", "tailwind", "ui-ux"],
    expires_at: null,
    score: 0.87,
    createdAt: "2026-10-30T15:20:00.000Z",
    updatedAt: "2026-10-30T15:20:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  },
  {
    _id: "mem_008",
    title: "Firebase Authentication Setup (Legacy)",
    content: "Initial prototype used Firebase Auth for quick Google login authentication. Note: Replaced due to multi-tenancy constraints.",
    category: "technical_decision",
    source: "Rahul (Tech Lead)",
    workspace: "default",
    status: "deprecated",
    superseded_by: "mem_002",
    conflicts_with: [],
    tags: ["auth", "firebase", "deprecated"],
    expires_at: null,
    score: 0.65,
    createdAt: "2026-09-15T09:00:00.000Z",
    updatedAt: "2026-10-26T14:15:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "archived"
  },
  {
    _id: "mem_009",
    title: "Sprint 42 Deliverables & Architecture Ownership",
    content: "Tithi owns MongoDB Vector search & Gemini embeddings pipeline. Krisha owns Express REST API layer and middleware. Soham owns React frontend, interactive conflict resolver, and UI/UX design system.",
    category: "general_knowledge",
    source: "Product Management",
    workspace: "default",
    status: "active",
    superseded_by: null,
    conflicts_with: [],
    tags: ["ownership", "roadmap", "roles", "sprint"],
    expires_at: null,
    score: 0.84,
    createdAt: "2026-10-30T18:00:00.000Z",
    updatedAt: "2026-10-30T18:00:00.000Z",
    vectorDimension: 3072,
    embeddingStatus: "indexed"
  }
];

export const INITIAL_CONFLICTS = [
  {
    id: "conf_001",
    status: "pending",
    detectedAt: "2026-10-31T11:42:00.000Z",
    severity: "high",
    proposedDecision: {
      title: "Adopt Firebase Auth for Mobile Flutter App",
      content: "Proposing we plug in Firebase Authentication for the mobile app to expedite social sign-ins and bypass custom backend token refresh routines.",
      source: "Arjun (Mobile Developer)",
      workspace: "default",
      category: "technical_decision",
      tags: ["mobile", "auth", "firebase"]
    },
    conflictingMemory: {
      _id: "mem_002",
      title: "Migrate from Firebase Auth to Custom JWT",
      content: "The engineering team finalized migrating from Firebase Auth to custom RS256 JWT tokens. Firebase lacked native support for multi-tenant RBAC and caused rate-limiting.",
      source: "Rahul (Tech Lead)",
      category: "technical_decision",
      createdAt: "2026-10-26T14:15:00.000Z",
      status: "active"
    },
    reason: "Direct architectural contradiction. The proposed decision attempts to reintroduce Firebase Auth into the tech stack, which was explicitly deprecated and prohibited in Memory #mem_002 due to enterprise multi-tenant RBAC and rate-limiting limitations.",
    recommendedAction: "Reject candidate proposal or supersede existing architecture decision through team tech-lead review."
  },
  {
    id: "conf_002",
    status: "pending",
    detectedAt: "2026-10-31T09:15:00.000Z",
    severity: "medium",
    proposedDecision: {
      title: "Automated Flush of Redis Cache on Every CI/CD Deploy",
      content: "Adding a post-deploy webhook hook that triggers FLUSHALL on Redis to purge stale UI cache keys immediately after release.",
      source: "Kunal (DevOps Engineer)",
      workspace: "default",
      category: "architecture_rule",
      tags: ["redis", "ci-cd", "deploy"]
    },
    conflictingMemory: {
      _id: "mem_003",
      title: "Redis Cluster Invalidation Rule",
      content: "During cache invalidation, never issue FLUSHALL on the primary Redis cluster during peak hours (10 AM - 6 PM IST). Always use scan-and-delete with cursor batches of 500.",
      source: "Priya (SRE Lead)",
      category: "architecture_rule",
      createdAt: "2026-10-27T11:00:00.000Z",
      status: "active"
    },
    reason: "Operational safety clash. Memory #mem_003 explicitly prohibits issuing FLUSHALL on the primary Redis cluster due to event loop stalls and downstream DB stampedes.",
    recommendedAction: "Replace FLUSHALL hook with batch scan-and-delete cursor script."
  }
];

import { AVATAR_PRESETS } from './avatars';

export const TEAM_MEMBERS = [
  {
    id: "user_001",
    name: "Soham",
    role: "Frontend & UI/UX Lead",
    email: "soham@knowbridge.ai",
    avatar: AVATAR_PRESETS[0].src,
    initials: "SO",
    color: "bg-indigo-600",
    contributions: 19,
    memoriesLogged: 7,
    conflictsResolved: 4,
    queriesRun: 32,
    status: "online",
    badges: ["Core Maintainer", "UI Architect"]
  },
  {
    id: "user_002",
    name: "Tithi",
    role: "Database & AI Memory Engine Lead",
    email: "tithi@knowbridge.ai",
    avatar: AVATAR_PRESETS[2].src,
    initials: "TC",
    color: "bg-purple-600",
    contributions: 34,
    memoriesLogged: 12,
    conflictsResolved: 8,
    queriesRun: 48,
    status: "online",
    badges: ["AI Architect", "Vector Indexer"]
  },
  {
    id: "user_003",
    name: "Krisha",
    role: "Backend & Express API Lead",
    email: "krisha@knowbridge.ai",
    avatar: AVATAR_PRESETS[4].src,
    initials: "KC",
    color: "bg-pink-600",
    contributions: 28,
    memoriesLogged: 9,
    conflictsResolved: 6,
    queriesRun: 29,
    status: "in-meeting",
    badges: ["REST Lead", "Security Guard"]
  },
  {
    id: "user_004",
    name: "Rahul",
    role: "Tech Lead",
    email: "rahul@knowbridge.ai",
    avatar: AVATAR_PRESETS[1].src,
    initials: "RL",
    color: "bg-blue-600",
    contributions: 42,
    memoriesLogged: 16,
    conflictsResolved: 11,
    queriesRun: 55,
    status: "online",
    badges: ["Tech Lead", "Architecture Reviewer"]
  },
  {
    id: "user_005",
    name: "Priya",
    role: "SRE Lead",
    email: "priya@knowbridge.ai",
    avatar: AVATAR_PRESETS[3].src,
    initials: "PR",
    color: "bg-emerald-600",
    contributions: 22,
    memoriesLogged: 8,
    conflictsResolved: 5,
    queriesRun: 21,
    status: "offline",
    badges: ["SRE Lead", "Chaos Engineer"]
  }
];

export const ACTIVITY_LOG = [
  {
    id: "act_001",
    type: "conflict_detected",
    actor: "KnowBridge AI Engine",
    description: "Flagged high-severity contradiction between Mobile Firebase PR and Memory #mem_002 (Custom JWT Standard)",
    timestamp: "12 minutes ago",
    badge: "Conflict Alert",
    badgeType: "warning"
  },
  {
    id: "act_002",
    type: "memory_added",
    actor: "Soham (Frontend Lead)",
    description: "Standardized Tailwind & Design System Tokens in 'default' workspace",
    timestamp: "1 hour ago",
    badge: "New Memory",
    badgeType: "success"
  },
  {
    id: "act_003",
    type: "ttl_scheduled",
    actor: "Engineering Manager",
    description: "Scheduled TTL auto-expiry for 'Q4 Code Freeze for Payment Gateways' on Nov 7, 2026",
    timestamp: "3 hours ago",
    badge: "TTL Index",
    badgeType: "info"
  },
  {
    id: "act_004",
    type: "memory_superseded",
    actor: "Rahul (Tech Lead)",
    description: "Superseded legacy Firebase Auth setup with Custom JWT tokens",
    timestamp: "Yesterday at 14:15",
    badge: "History Preserved",
    badgeType: "neutral"
  },
  {
    id: "act_005",
    type: "query_answered",
    actor: "KnowBridge Assistant",
    description: "Grounded answer generated for: 'Why did we choose PostgreSQL for billing?' with 96% citation confidence",
    timestamp: "Yesterday at 11:30",
    badge: "Gemini Q&A",
    badgeType: "brand"
  }
];

export const CATEGORY_DEFINITIONS = {
  technical_decision: {
    label: "Technical Decisions",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
    icon: "Cpu",
    description: "Architectural choices, database engines, language runtimes, and framework migrations."
  },
  architecture_rule: {
    label: "Architectural Rules",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
    icon: "ShieldAlert",
    description: "Best practices, security guardrails, coding standards, and forbidden patterns."
  },
  incident_resolution: {
    label: "Incident Resolutions",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    icon: "Flame",
    description: "Post-mortems, bug workarounds, failover fixes, and production mitigations."
  },
  temporary_constraint: {
    label: "Temporary Constraints",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
    icon: "Clock",
    description: "Time-bound deployment freezes, temporary feature flags, and scheduled rules with TTL."
  },
  general_knowledge: {
    label: "General Knowledge",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    icon: "BookOpen",
    description: "Domain context, sprint ownership, onboarding walkthroughs, and team agreements."
  }
};
