/**
 * KnowBridge API Service Layer
 * Follows API_INTEGRATION_GUIDE.md contracts.
 * 
 * Supports seamless hybrid operation:
 * - Attempts live backend call when configured or available.
 * - Automatically falls back to high-fidelity in-memory client engine
 *   so the UI works 100% offline and in live demo presentations.
 */

import {
  INITIAL_MEMORIES,
  INITIAL_CONFLICTS,
  ACTIVITY_LOG,
  TEAM_MEMBERS
} from './mockData';
import { AVATAR_PRESETS, DEFAULT_AVATAR } from './avatars';

// Configurable API root. Connects to live Render backend by default.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://knowbridge-v83x.onrender.com';

// Persistent client storage keys
export const STORAGE_KEYS = {
  MEMORIES: 'knowbridge_memories',
  CONFLICTS: 'knowbridge_conflicts',
  ACTIVITIES: 'knowbridge_activities',
  WORKSPACES: 'knowbridge_workspaces',
  CONFIG: 'knowbridge_config'
};

export const INITIAL_WORKSPACES = [
  {
    id: 'default',
    name: 'Core Engineering (Demo)',
    description: 'Shared architecture rules and decision history for Core Engineering.',
    owner: 'user_004',
    ownerName: 'Rahul (Tech Lead)',
    isDemo: true,
    createdAt: '2026-10-24T10:00:00.000Z'
  },
  {
    id: 'payments-core',
    name: 'Payments & Ledger',
    description: 'Billing, Stripe webhooks, and ledger transactions.',
    owner: 'user_005',
    ownerName: 'Priya (SRE Lead)',
    isDemo: true,
    createdAt: '2026-10-25T11:00:00.000Z'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Team',
    description: 'Flutter and React Native clients, auth tokens, and offline caching.',
    owner: 'user_001',
    ownerName: 'Soham (Frontend Lead)',
    isDemo: true,
    createdAt: '2026-10-26T12:00:00.000Z'
  }
];

// Initialize localStorage with initial seeds if not present
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.MEMORIES)) {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(INITIAL_MEMORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFLICTS)) {
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(INITIAL_CONFLICTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(ACTIVITY_LOG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORKSPACES)) {
    localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(INITIAL_WORKSPACES));
  }
}

initializeLocalStorage();

// Helper to simulate realistic async network latency (250ms - 400ms)
const simulateLatency = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to get stored memories
function getStoredMemories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    return raw ? JSON.parse(raw) : INITIAL_MEMORIES;
  } catch {
    return INITIAL_MEMORIES;
  }
}

// Helper to save stored memories
function setStoredMemories(memories) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Helper to get stored conflicts
function getStoredConflicts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
    return raw ? JSON.parse(raw) : INITIAL_CONFLICTS;
  } catch {
    return INITIAL_CONFLICTS;
  }
}

// Helper to save stored conflicts
function setStoredConflicts(conflicts) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
  } catch (e) {
    console.error('Failed to save conflicts to localStorage:', e);
  }
}

// Helper to add activity
export function recordActivity({ actor, description, badge, badgeType = 'info', workspace = 'default' }) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const list = raw ? JSON.parse(raw) : ACTIVITY_LOG;
    const item = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actor: actor || 'KnowBridge Engine',
      description,
      workspace: workspace || 'default',
      timestamp: 'Just now',
      badge: badge || 'Update',
      badgeType
    };
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list.slice(0, 50)));
    return item;
  } catch {
    return null;
  }
}

/**
 * ============================================================================
 * 1. MEMORIES API
 * ============================================================================
 */

/**
 * List all memories (with optional filtering by workspace, status, category, search)
 * Matches: GET /api/memories?workspace=default&status=active
 */
export async function getMemories({ workspace = null, status = 'all', category = 'all', search = '' } = {}) {
  // If no workspace is specified or user has no workspace selected, return empty list
  if (!workspace) {
    return {
      success: true,
      count: 0,
      data: [],
      source: 'mock'
    };
  }

  try {
    // Attempt live backend fetch with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const queryParams = new URLSearchParams();
    if (workspace && workspace !== 'all') queryParams.append('workspace', workspace);
    if (status && status !== 'all') queryParams.append('status', status);

    const res = await fetch(`${API_BASE_URL}/api/memories?${queryParams.toString()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return { success: true, count: json.data.length, data: json.data, source: 'backend' };
      }
    }
  } catch {
    // Fall back to client storage
  }

  await simulateLatency(250);
  let memories = getStoredMemories();

  // Apply filters strictly by workspace
  if (workspace && workspace !== 'all') {
    memories = memories.filter(m => (m.workspace || 'default') === workspace);
  }

  if (status && status !== 'all') {
    memories = memories.filter(m => m.status === status);
  }

  if (category && category !== 'all') {
    memories = memories.filter(m => m.category === category);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    memories = memories.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      (m.source && m.source.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  return {
    success: true,
    count: memories.length,
    data: memories,
    source: 'mock'
  };
}

/**
 * Save New Memory (Generates vector embedding)
 * Matches: POST /api/memories
 */
export async function saveMemory(memoryData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memoryData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { success: true, data: json.data, source: 'backend' };
      }
    }
  } catch {
    // Fallback
  }

  await simulateLatency(350);
  const memories = getStoredMemories();

  const newMemory = {
    _id: `mem_${Date.now()}`,
    title: memoryData.title,
    content: memoryData.content,
    category: memoryData.category || 'technical_decision',
    source: memoryData.source || 'Soham (Frontend Lead)',
    workspace: memoryData.workspace || 'default',
    status: 'active',
    superseded_by: null,
    conflicts_with: [],
    tags: Array.isArray(memoryData.tags) ? memoryData.tags : (memoryData.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    expires_at: memoryData.expires_at || null,
    score: 0.95,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vectorDimension: 3072,
    embeddingStatus: 'indexed'
  };

  memories.unshift(newMemory);
  setStoredMemories(memories);

  recordActivity({
    actor: newMemory.source,
    description: `Logged decision: "${newMemory.title}" in workspace [${newMemory.workspace}]`,
    badge: 'Decision Saved',
    badgeType: 'success'
  });

  return {
    success: true,
    data: newMemory,
    source: 'mock'
  };
}

/**
 * Check for Conflicts Before Saving
 * Matches: POST /api/memories/check-conflict
 */
export async function checkConflict({ title, content, workspace = 'default' }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories/check-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, workspace })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch {
    // Fallback
  }

  await simulateLatency(400);
  const memories = getStoredMemories();
  const lower = `${title || ''} ${content || ''}`.toLowerCase();

  // Smart heuristic rule detection
  let detected = null;

  if (lower.includes('firebase') && (lower.includes('auth') || lower.includes('token') || lower.includes('login'))) {
    const jwtMem = memories.find(m => m._id === 'mem_002' || m.title.toLowerCase().includes('jwt'));
    if (jwtMem && jwtMem.status === 'active') {
      detected = {
        hasConflict: true,
        conflictingMemory: jwtMem,
        reason: 'Architectural contradiction: Team previously standardized on Custom JWT tokens (RS256) and deprecated Firebase Auth due to multi-tenant RBAC and rate-limiting limits.',
        recommendedAction: 'Supersede the older decision or review multi-tenancy requirements with Tech Lead Rahul.'
      };
    }
  } else if (lower.includes('redis') && (lower.includes('flushall') || lower.includes('flush') || lower.includes('clear all'))) {
    const redisMem = memories.find(m => m._id === 'mem_003' || m.title.toLowerCase().includes('redis'));
    if (redisMem && redisMem.status === 'active') {
      detected = {
        hasConflict: true,
        conflictingMemory: redisMem,
        reason: 'Production rule violation: Redis Cluster Invalidation Rule strictly forbids FLUSHALL during production traffic to avoid Node.js event loop blocks.',
        recommendedAction: 'Switch to scan-and-delete cursor pattern in batches of 500 keys.'
      };
    }
  } else if (lower.includes('direct') && (lower.includes('mongoose') || lower.includes('mongo') || lower.includes('database')) && (lower.includes('lambda') || lower.includes('serverless'))) {
    const lambdaMem = memories.find(m => m._id === 'mem_006' || m.title.toLowerCase().includes('direct db'));
    if (lambdaMem && lambdaMem.status === 'active') {
      detected = {
        hasConflict: true,
        conflictingMemory: lambdaMem,
        reason: 'Connection pooling violation: Direct DB connections from serverless lambdas exhaust Atlas connection pools. Must route through Internal Data Gateway.',
        recommendedAction: 'Route lambda database calls through Internal Data Gateway proxy.'
      };
    }
  }

  if (detected) {
    return { success: true, data: detected, source: 'mock' };
  }

  return {
    success: true,
    data: {
      hasConflict: false,
      conflictingMemory: null,
      reason: null,
      recommendedAction: null
    },
    source: 'mock'
  };
}

/**
 * Supersede Memory (Preserve history and deprecate previous memory)
 * Matches: PUT /api/memories/:id/supersede
 */
export async function supersedeMemory(oldMemoryId, newMemoryData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories/${oldMemoryId}/supersede`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMemoryData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch {
    // Fallback
  }

  await simulateLatency(300);
  const memories = getStoredMemories();
  const oldIndex = memories.findIndex(m => m._id === oldMemoryId);

  const newId = `mem_${Date.now()}`;
  const activeMemory = {
    _id: newId,
    title: newMemoryData.title,
    content: newMemoryData.content,
    category: newMemoryData.category || 'technical_decision',
    source: newMemoryData.source || 'Rahul (Tech Lead)',
    workspace: newMemoryData.workspace || 'default',
    status: 'active',
    superseded_by: null,
    conflicts_with: [],
    tags: newMemoryData.tags || ['updated', 'superseded'],
    expires_at: newMemoryData.expires_at || null,
    score: 0.98,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vectorDimension: 3072,
    embeddingStatus: 'indexed'
  };

  let deprecatedMemory = null;
  if (oldIndex !== -1) {
    memories[oldIndex].status = 'deprecated';
    memories[oldIndex].superseded_by = newId;
    deprecatedMemory = memories[oldIndex];
  }

  memories.unshift(activeMemory);
  setStoredMemories(memories);

  recordActivity({
    actor: activeMemory.source,
    description: `Superseded "${deprecatedMemory ? deprecatedMemory.title : oldMemoryId}" with new decision "${activeMemory.title}"`,
    badge: 'History Preserved',
    badgeType: 'brand'
  });

  return {
    success: true,
    data: {
      deprecatedMemory,
      activeMemory
    },
    source: 'mock'
  };
}

/**
 * ============================================================================
 * 2. AI EXTRACTION & CHAT Q&A
 * ============================================================================
 */

/**
 * Extract Decisions from Chat / Notes
 * Matches: POST /api/memories/extract
 */
export async function extractMemoriesFromText(text, source = 'Team Member') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch {
    // Fallback
  }

  await simulateLatency(700);

  // High-fidelity extraction simulation
  // Parses meeting notes or chat snippets into structured candidate memories
  const extracted = [];
  const lower = text.toLowerCase();

  if (lower.includes('postgres') || lower.includes('database') || lower.includes('billing')) {
    extracted.push({
      title: "Standardize PostgreSQL for ACID Financial Transactions",
      content: "Ensure all high-integrity ledger and payment state operations execute on PostgreSQL to maintain ACID constraints and prevent balance race conditions.",
      category: "technical_decision",
      source: source || "Rahul (Tech Lead)",
      tags: ["database", "postgresql", "acid", "finance"],
      expires_at: null
    });
  }

  if (lower.includes('redis') || lower.includes('cache')) {
    extracted.push({
      title: "Redis Cluster Cursor Scanning Rule",
      content: "Prohibit bulk FLUSH commands. Mandate scan-and-delete pattern to avoid production node starvation.",
      category: "architecture_rule",
      source: source || "Priya (SRE Lead)",
      tags: ["redis", "caching", "performance"],
      expires_at: null
    });
  }

  if (lower.includes('freeze') || lower.includes('diwali') || lower.includes('deploy')) {
    extracted.push({
      title: "Temporary Deployment Hold for Payment Services",
      content: "Hold all non-critical feature deployments on checkout services during festival surge. Hotfixes require dual VP signoff.",
      category: "temporary_constraint",
      source: source || "Engineering Manager",
      tags: ["freeze", "deployment", "payments"],
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString()
    });
  }

  // Fallback generic extraction if text didn't trigger specific keywords
  if (extracted.length === 0) {
    const firstLine = text.split('\n')[0].substring(0, 60).replace(/^[#\-* ]+/, '') || "Extracted Architectural Decision";
    extracted.push({
      title: firstLine,
      content: text.length > 300 ? text.substring(0, 290) + '...' : text,
      category: "technical_decision",
      source: source || "Meeting Transcript",
      tags: ["architecture", "decision", "auto-extracted"],
      expires_at: null
    });
  }

  return {
    success: true,
    count: extracted.length,
    data: extracted,
    source: 'mock'
  };
}

/**
 * Ask Question (Context-Aware Q&A + Memory Citations)
 * Matches: POST /api/chat
 */
export async function askQuestion(question, workspace = 'default') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, workspace })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch {
    // Fallback
  }

  await simulateLatency(650);

  const memories = getStoredMemories();
  const qLower = question.toLowerCase();

  // Find relevant memories
  let cited = memories.filter(m => {
    const text = `${m.title} ${m.content} ${(m.tags || []).join(' ')}`.toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => text.includes(w));
  });

  if (cited.length === 0) {
    cited = memories.slice(0, 2);
  } else {
    cited = cited.slice(0, 3);
  }

  // Craft grounded answer
  let answer = "";
  if (qLower.includes('billing') || qLower.includes('postgres') || qLower.includes('database')) {
    answer = `Based on the architectural decision logged by **Rahul (Tech Lead)** on Oct 24, our team deliberately chose **PostgreSQL** over MongoDB for the billing ledger.\n\n` +
      `**Key Rationale:**\n` +
      `1. **ACID Transactions**: Required for guaranteed foreign key integrity and ledger balancing across multi-currency accounts.\n` +
      `2. **Audit Compliance**: Financial audit regulations mandate strict ledger balance constraints that relational schemas enforce natively.\n\n` +
      `*MongoDB remains our primary store for flexible team memories and vector document storage.*`;
  } else if (qLower.includes('auth') || qLower.includes('jwt') || qLower.includes('firebase')) {
    answer = `According to team decision *#mem_002* logged by **Rahul (Tech Lead)**, KnowBridge migrated **from Firebase Auth to custom RS256 JWT tokens**.\n\n` +
      `**Why this was decided:**\n` +
      `• Firebase Auth lacked native support for our multi-tenant role-based access control (RBAC).\n` +
      `• Firebase introduced rate-limiting bottlenecks during enterprise single sign-on (SSO) handshakes.\n\n` +
      `**Current Policy:** All microservices and client apps must authenticate using RS256 asymmetric JWT tokens. Direct Firebase client SDKs are prohibited.`;
  } else if (qLower.includes('redis') || qLower.includes('cache') || qLower.includes('flush')) {
    answer = `As specified in the **Redis Cluster Invalidation Rule** documented by **Priya (SRE Lead)**:\n\n` +
      `⚠️ **Never execute \`FLUSHALL\` on the primary Redis cluster during peak hours (10 AM – 6 PM IST).**\n\n` +
      `**Enforced Procedure:** Always use scan-and-delete with cursor batches of 500 keys to avoid blocking the Node.js event loop and triggering cascading database connection spikes.`;
  } else if (qLower.includes('freeze') || qLower.includes('code freeze') || qLower.includes('deploy')) {
    answer = `Yes, there is currently an **active Q4 Code Freeze** on payment gateways and checkout microservices in preparation for high-concurrency Diwali traffic.\n\n` +
      `• **Status**: Active Temporary Constraint\n` +
      `• **TTL Expiry**: Auto-expires on **November 7, 2026** via native MongoDB TTL Index.\n` +
      `• **Exceptions**: Emergency hotfixes require explicit sign-off from the VP of Engineering.`;
  } else {
    answer = `Based on active team knowledge in the **'${workspace}'** workspace, here is what our verified architecture records indicate regarding "${question}":\n\n` +
      `Our records show related guidance from **${cited[0]?.source || 'Engineering'}** in *" ${cited[0]?.title || 'System Guidelines'} "*.\n\n` +
      `To ensure engineering decisions remain consistent, verify that any new implementation adheres to established RBAC standards and data gateway routing rules.`;
  }

  recordActivity({
    actor: 'KnowBridge Assistant',
    description: `Grounded Q&A: "${question.substring(0, 45)}..." (${cited.length} memories cited)`,
    badge: 'AI Search',
    badgeType: 'brand'
  });

  return {
    success: true,
    data: {
      question,
      answer,
      memoriesCited: cited.map((m, i) => ({
        id: m._id,
        title: m.title,
        category: m.category,
        source: m.source,
        relevanceScore: Number((0.96 - i * 0.04).toFixed(3)),
        contentSnippet: m.content.substring(0, 140) + '...',
        createdAt: m.createdAt
      }))
    },
    source: 'mock'
  };
}

/**
 * ============================================================================
 * 3. CONFLICTS MANAGEMENT API
 * ============================================================================
 */

export async function getConflicts(workspace = 'all') {
  await simulateLatency(200);
  if (!workspace) {
    return {
      success: true,
      data: [],
      source: 'mock'
    };
  }
  let conflicts = getStoredConflicts();
  if (workspace && workspace !== 'all') {
    conflicts = conflicts.filter(c => 
      (c.proposedDecision?.workspace || 'default') === workspace ||
      (c.conflictingMemory?.workspace || 'default') === workspace
    );
  }
  return {
    success: true,
    data: conflicts,
    source: 'mock'
  };
}

export async function resolveConflict(conflictId, resolutionAction, updatedData = null) {
  await simulateLatency(300);
  const conflicts = getStoredConflicts();
  const index = conflicts.findIndex(c => c.id === conflictId);

  if (index === -1) {
    throw new Error('Conflict record not found');
  }

  const target = conflicts[index];

  if (resolutionAction === 'supersede') {
    // Supersede old memory with candidate decision
    await supersedeMemory(target.conflictingMemory._id, {
      title: target.proposedDecision.title,
      content: target.proposedDecision.content,
      category: target.proposedDecision.category,
      source: target.proposedDecision.source,
      workspace: target.proposedDecision.workspace,
      tags: target.proposedDecision.tags
    });
    target.status = 'resolved_superseded';
  } else if (resolutionAction === 'reject') {
    target.status = 'resolved_rejected';
    recordActivity({
      actor: 'Tech Lead Review',
      description: `Rejected candidate proposal "${target.proposedDecision.title}" to protect active architecture rule`,
      badge: 'Conflict Closed',
      badgeType: 'neutral'
    });
  } else if (resolutionAction === 'exception') {
    target.status = 'resolved_exception';
    recordActivity({
      actor: 'Architecture Review',
      description: `Marked "${target.proposedDecision.title}" as scoped exception`,
      badge: 'Exception Granted',
      badgeType: 'warning'
    });
  }

  target.resolvedAt = new Date().toISOString();
  conflicts[index] = target;
  setStoredConflicts(conflicts);

  return {
    success: true,
    data: target
  };
}

/**
 * ============================================================================
 * 4. TEAM & WORKSPACES
 * ============================================================================
 */

export async function getWorkspaces(userEmail = null) {
  await simulateLatency(100);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    const list = raw ? JSON.parse(raw) : INITIAL_WORKSPACES;

    // If no user email specified, return demo workspaces only
    if (!userEmail) {
      return {
        success: true,
        data: list.filter((w) => w.isDemo)
      };
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    // Isolated Multi-Tenant Workspace Rule:
    // A workspace is only accessible to a user if:
    // 1. It is a demo workspace (isDemo === true)
    // 2. OR the user created it (ownerEmail === cleanEmail)
    // 3. OR the user was added as a teammate to this workspace (memberEmails or team roster)
    const filtered = list.filter((ws) => {
      if (ws.isDemo) return true;
      if (ws.ownerEmail && ws.ownerEmail.toLowerCase() === cleanEmail) return true;
      if (Array.isArray(ws.memberEmails) && ws.memberEmails.some((e) => e.toLowerCase() === cleanEmail)) return true;

      // Check team roster in localStorage
      try {
        const teamRaw = localStorage.getItem(`knowbridge_team_members_${ws.id}`);
        if (teamRaw) {
          const teamList = JSON.parse(teamRaw);
          if (Array.isArray(teamList) && teamList.some((m) => m.email && m.email.toLowerCase() === cleanEmail)) {
            return true;
          }
        }
      } catch {
        // fallback
      }

      return false;
    });

    return {
      success: true,
      data: filtered
    };
  } catch {
    return { success: true, data: INITIAL_WORKSPACES };
  }
}

export async function createWorkspace({ name, description = '', owner = 'user_001', ownerName = 'Team Member', ownerEmail = '' }) {
  await simulateLatency(250);
  const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
  const list = raw ? JSON.parse(raw) : [...INITIAL_WORKSPACES];

  const cleanOwnerEmail = (ownerEmail || '').toLowerCase().trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `ws-${Date.now()}`;
  const newWorkspace = {
    id: `ws_${Date.now()}_${slug}`,
    name: name.trim(),
    description: description.trim() || 'Custom team engineering workspace',
    owner,
    ownerName,
    ownerEmail: cleanOwnerEmail,
    isDemo: false,
    members: [ownerName],
    memberEmails: cleanOwnerEmail ? [cleanOwnerEmail] : [],
    createdAt: new Date().toISOString()
  };

  list.push(newWorkspace);
  localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(list));

  recordActivity({
    actor: ownerName,
    description: `Created new workspace "${newWorkspace.name}"`,
    badge: 'New Workspace',
    badgeType: 'brand',
    workspace: newWorkspace.id
  });

  return {
    success: true,
    data: newWorkspace
  };
}

export async function deleteWorkspace(workspaceId, actorName = 'Engineer') {
  await simulateLatency(200);
  try {
    // Prevent deletion of pre-seeded demo workspaces
    if (workspaceId === 'default' || workspaceId === 'payments-core' || workspaceId === 'mobile-app') {
      return { success: false, error: 'Cannot delete core demo workspaces.' };
    }

    // 1. Remove workspace record
    const rawWs = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    let wsList = rawWs ? JSON.parse(rawWs) : [...INITIAL_WORKSPACES];
    const targetWs = wsList.find((w) => w.id === workspaceId);
    wsList = wsList.filter((w) => w.id !== workspaceId);
    localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(wsList));

    // 2. Remove all memories belonging to this workspace
    const rawMems = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (rawMems) {
      const memList = JSON.parse(rawMems).filter((m) => m.workspace !== workspaceId);
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memList));
    }

    // 3. Remove all conflicts belonging to this workspace
    const rawConfs = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
    if (rawConfs) {
      const confList = JSON.parse(rawConfs).filter((c) => c.workspace !== workspaceId);
      localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(confList));
    }

    // 4. Remove workspace team roster
    localStorage.removeItem(`knowbridge_team_members_${workspaceId}`);

    // 5. Record activity
    recordActivity({
      actor: actorName,
      description: `Permanently deleted workspace "${targetWs?.name || workspaceId}" and all scoped memories`,
      badge: 'Workspace Deleted',
      badgeType: 'warning'
    });

    return {
      success: true,
      workspaceId,
      deletedWorkspaceName: targetWs?.name || workspaceId
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

const AVATAR_POOL = AVATAR_PRESETS.map((p) => p.src);

export async function getTeamMembers(workspace = 'default', currentUser = null) {
  await simulateLatency(120);

  // If demo workspace, return seeded team members
  if (workspace === 'default' || workspace === 'payments-core' || workspace === 'mobile-app') {
    return {
      success: true,
      data: TEAM_MEMBERS
    };
  }

  // If user has no workspace selected
  if (!workspace) {
    return {
      success: true,
      data: currentUser ? [currentUser] : []
    };
  }

  try {
    const key = `knowbridge_team_members_${workspace}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return { success: true, data: JSON.parse(raw) };
    }

    // Default initialization for new workspace: Current user is the owner
    const initialList = [];
    if (currentUser) {
      initialList.push({
        id: currentUser.id || 'user_owner',
        name: currentUser.name || 'Engineer',
        role: currentUser.role || 'Workspace Owner',
        email: currentUser.email || 'engineer@company.com',
        avatar: currentUser.avatar || AVATAR_POOL[0],
        initials: currentUser.initials || 'ME',
        color: 'bg-brand-600',
        contributions: 0,
        memoriesLogged: 0,
        conflictsResolved: 0,
        queriesRun: 0,
        status: 'online',
        badges: ['Workspace Creator', 'Core Engineer']
      });
    }
    localStorage.setItem(key, JSON.stringify(initialList));
    return { success: true, data: initialList };
  } catch {
    return { success: true, data: [] };
  }
}

export async function addTeamMember(workspace, memberData, inviterName = 'Team Lead') {
  await simulateLatency(200);
  if (!workspace) {
    throw new Error('Please select or create an active workspace first.');
  }

  const key = `knowbridge_team_members_${workspace}`;
  let list = [];
  try {
    const raw = localStorage.getItem(key);
    list = raw ? JSON.parse(raw) : [];
  } catch {
    list = [];
  }

  // Derive initials
  const initials = memberData.name
    ? memberData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'TM';

  // Avatar from pool
  const avatarIndex = (list.length + 1) % AVATAR_POOL.length;
  const avatar = memberData.avatar || AVATAR_POOL[avatarIndex];

  const newMember = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: memberData.name.trim(),
    role: memberData.role || 'Senior Software Engineer',
    email: memberData.email.trim().toLowerCase(),
    avatar,
    initials,
    color: 'bg-indigo-600',
    contributions: 0,
    memoriesLogged: 0,
    conflictsResolved: 0,
    queriesRun: 0,
    status: memberData.status || 'online',
    badges: memberData.specialty ? [memberData.specialty, 'Core Engineer'] : ['New Teammate', 'Core Engineer'],
    joinedAt: new Date().toISOString()
  };

  list.push(newMember);
  localStorage.setItem(key, JSON.stringify(list));

  // Sync teammate email into workspace record in localStorage
  try {
    const rawWs = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    if (rawWs) {
      let wsList = JSON.parse(rawWs);
      wsList = wsList.map((ws) => {
        if (ws.id === workspace) {
          const currentEmails = Array.isArray(ws.memberEmails)
            ? ws.memberEmails
            : (ws.ownerEmail ? [ws.ownerEmail.toLowerCase()] : []);
          const updatedEmails = Array.from(new Set([...currentEmails, newMember.email.toLowerCase()]));
          const currentMembers = Array.isArray(ws.members) ? ws.members : [];
          return {
            ...ws,
            members: Array.from(new Set([...currentMembers, newMember.name])),
            memberEmails: updatedEmails
          };
        }
        return ws;
      });
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(wsList));
    }
  } catch (err) {
    console.error('Failed to sync member email into workspace:', err);
  }

  // Also if this user exists in knowbridge_users_registry, add this workspace to their workspaces!
  try {
    const rawRegistry = localStorage.getItem('knowbridge_users_registry');
    if (rawRegistry) {
      const registry = JSON.parse(rawRegistry);
      const targetUser = registry[newMember.email.toLowerCase()];
      if (targetUser) {
        const userWs = Array.isArray(targetUser.workspaces) ? targetUser.workspaces : [];
        targetUser.workspaces = Array.from(new Set([...userWs, workspace]));
        if (!targetUser.activeWorkspace) {
          targetUser.activeWorkspace = workspace;
        }
        registry[newMember.email.toLowerCase()] = targetUser;
        localStorage.setItem('knowbridge_users_registry', JSON.stringify(registry));
      }
    }
  } catch (err) {
    console.error('Failed to update user registry on team invite:', err);
  }

  recordActivity({
    actor: inviterName || 'Team Lead',
    description: `Added teammate "${newMember.name}" (${newMember.role}) to workspace`,
    badge: 'Teammate Added',
    badgeType: 'brand',
    workspace
  });

  return {
    success: true,
    data: newMember
  };
}

export async function removeTeamMember(workspace, memberId, actorName = 'Team Lead') {
  await simulateLatency(150);
  if (!workspace) return { success: false };

  const key = `knowbridge_team_members_${workspace}`;
  try {
    const raw = localStorage.getItem(key);
    let list = raw ? JSON.parse(raw) : [];
    const removedMember = list.find(m => m.id === memberId);
    list = list.filter(m => m.id !== memberId);
    localStorage.setItem(key, JSON.stringify(list));

    // Remove teammate email from workspace record
    try {
      const rawWs = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (rawWs && removedMember?.email) {
        let wsList = JSON.parse(rawWs);
        wsList = wsList.map((ws) => {
          if (ws.id === workspace && Array.isArray(ws.memberEmails)) {
            return {
              ...ws,
              memberEmails: ws.memberEmails.filter(
                (e) => e.toLowerCase() !== removedMember.email.toLowerCase()
              )
            };
          }
          return ws;
        });
        localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(wsList));
      }
    } catch (err) {
      console.error('Failed to update workspace on member removal:', err);
    }

    if (removedMember) {
      recordActivity({
        actor: actorName,
        description: `Removed teammate "${removedMember.name}" from workspace`,
        badge: 'Member Removed',
        badgeType: 'neutral',
        workspace
      });
    }

    return { success: true, memberId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getActivityLog(workspace = 'all') {
  await simulateLatency(150);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    let list = raw ? JSON.parse(raw) : ACTIVITY_LOG;
    if (!workspace) {
      return { success: true, data: [] };
    }
    if (workspace && workspace !== 'all') {
      list = list.filter(a => (a.workspace || 'default') === workspace);
    }
    return {
      success: true,
      data: list
    };
  } catch {
    return { success: true, data: [] };
  }
}

/**
 * Reset local storage to initial sample demo state
 */
export function resetToSeedData() {
  localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(INITIAL_MEMORIES));
  localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(INITIAL_CONFLICTS));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(ACTIVITY_LOG));
  localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(INITIAL_WORKSPACES));
  return true;
}
