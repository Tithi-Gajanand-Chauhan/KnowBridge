const Memory = require('../models/Memory');
const { generateText, generateEmbedding } = require('../config/gemini');

/**
 * Calculate cosine similarity between two numeric vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Clean and parse JSON response from Gemini LLM
 */
function safeParseJSON(rawText) {
  try {
    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[Memory Engine] Failed to parse JSON from AI response:', rawText);
    return null;
  }
}

/**
 * 1. MEMORY EXTRACTION
 * Analyzes conversation text and extracts structured memories.
 * Discards casual chatter and keeps only meaningful decisions/rules.
 */
async function extractMemories(conversationText, defaultSource = 'Team Member') {
  if (!conversationText || conversationText.trim().length === 0) {
    return [];
  }

  const prompt = `
Analyze the following team conversation or notes and extract only meaningful, persistent knowledge.
Focus exclusively on:
- Technical decisions (e.g. database choice, library adoption or migration)
- Architectural rules (e.g. authentication pattern, coding standards)
- Incident resolutions (e.g. post-mortems, bug workarounds)
- Temporary constraints (e.g. deployment freeze, temporary API bypass with expiry)

DO NOT extract casual chatter, greetings, lunch plans, or trivial operational comments.
If there are NO meaningful technical decisions or rules, return an empty array [].

For each valid memory, return a JSON object with:
- "title": Short concise headline (e.g. "Migrate from Firebase to Custom JWT")
- "content": Clear description including the "why" and rationale
- "category": One of ["technical_decision", "architecture_rule", "incident_resolution", "temporary_constraint", "general_knowledge"]
- "source": Name of the person or source if mentioned, otherwise "${defaultSource}"
- "tags": Array of 2-4 keywords
- "expires_at": ISO date string if this is a time-bound rule/freeze, otherwise null

Input conversation:
"""
${conversationText}
"""

Return ONLY a valid JSON array of objects. Do not include markdown formatting or commentary.
`;

  try {
    const responseText = await generateText(
      prompt,
      'You are an expert AI technical lead. You extract high-signal software architectural memories and return strictly valid JSON arrays.'
    );

    const parsed = safeParseJSON(responseText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Memory Engine] Error extracting memories:', err.message);
    throw err;
  }
}

/**
 * 2. MEMORY STORAGE
 * Generates vector embedding and saves memory to MongoDB with workspace scoping.
 */
async function saveMemory({
  title,
  content,
  category = 'technical_decision',
  source = 'Team Member',
  workspace = 'default',
  tags = [],
  expires_at = null,
}) {
  if (!title || !content) {
    throw new Error('Both title and content are required to save a memory.');
  }

  // Combine title, content, and category for a rich embedding representation
  const textToEmbed = `Title: ${title}\nCategory: ${category}\nContent: ${content}\nTags: ${tags.join(', ')}`;
  const embedding = await generateEmbedding(textToEmbed);

  const memory = new Memory({
    title,
    content,
    category,
    source,
    workspace,
    tags,
    expires_at: expires_at ? new Date(expires_at) : null,
    status: 'active',
    embedding,
  });

  await memory.save();
  return memory;
}

/**
 * 3. SEMANTIC RETRIEVAL
 * Retrieves relevant active memories using MongoDB Atlas Vector Search.
 * If the Atlas Vector index is not yet built, seamlessly falls back to cosine search.
 */
async function retrieveMemories(queryText, workspace = 'default', limit = 4) {
  if (!queryText || queryText.trim().length === 0) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(queryText);

  // Attempt 1: Native MongoDB Atlas Vector Search
  try {
    const vectorPipeline = [
      {
        $vectorSearch: {
          index: 'vector_index', // Atlas Vector Search index name
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 20,
          limit: limit,
          filter: {
            workspace: { $eq: workspace },
            status: { $eq: 'active' },
          },
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          category: 1,
          source: 1,
          workspace: 1,
          status: 1,
          tags: 1,
          expires_at: 1,
          createdAt: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const results = await Memory.aggregate(vectorPipeline);
    if (results && results.length > 0) {
      return results;
    }
  } catch (vectorErr) {
    // Atlas Vector Search index might not be configured yet; fallback smoothly.
    console.warn('[Memory Engine] Atlas Vector Search unavailable or indexing in progress. Falling back to semantic cosine scan:', vectorErr.message);
  }

  // Attempt 2: Resilient Cosine Similarity Fallback (so app never breaks)
  const activeMemories = await Memory.find({
    workspace,
    status: 'active',
  }).select('+embedding');

  const scored = activeMemories
    .map((mem) => {
      const sim = mem.embedding ? cosineSimilarity(queryEmbedding, mem.embedding) : 0;
      return {
        _id: mem._id,
        title: mem.title,
        content: mem.content,
        category: mem.category,
        source: mem.source,
        workspace: mem.workspace,
        status: mem.status,
        tags: mem.tags,
        expires_at: mem.expires_at,
        createdAt: mem.createdAt,
        score: Number(sim.toFixed(4)),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * 4. CONFLICT DETECTION
 * Compares a candidate new decision against existing active memories.
 * Flags semantic contradictions and preserves history without overwriting.
 */
async function detectConflict(candidateDecision, workspace = 'default') {
  const { title, content } = candidateDecision;
  if (!content) return { hasConflict: false, conflictingMemories: [] };

  // Retrieve candidate-relevant active memories
  const relevantMemories = await retrieveMemories(`${title || ''} ${content}`, workspace, 5);

  if (relevantMemories.length === 0) {
    return { hasConflict: false, conflictingMemories: [] };
  }

  const prompt = `
You are an architectural conflict detection agent for a software engineering team.
Analyze whether the "Candidate New Decision" CONTRADICTS, OVERTURNS, or INCOMPATIBLY CLASHES with any of the "Existing Active Memories".

Candidate New Decision:
Title: ${title}
Content: ${content}

Existing Active Memories:
${relevantMemories
  .map(
    (m, i) => `
[Memory #${i + 1}] ID: ${m._id}
Title: ${m.title}
Content: ${m.content}
Source: ${m.source}
`
  )
  .join('\n')}

Rules:
- A conflict exists ONLY if the new decision directly contradicts or reverses an active rule/decision (e.g., choosing Firebase when a rule states Firebase is banned in favor of JWT).
- Complementary or non-overlapping decisions are NOT conflicts.

Respond with ONLY valid JSON:
{
  "hasConflict": boolean,
  "conflictingMemoryId": "ID of conflicting memory or null",
  "reason": "Clear explanation of the contradiction",
  "recommendedAction": "e.g., Supersede older decision or keep existing"
}
`;

  try {
    const rawAnalysis = await generateText(prompt);
    const parsed = safeParseJSON(rawAnalysis);

    if (parsed && parsed.hasConflict) {
      const conflictingDoc = relevantMemories.find(
        (m) => String(m._id) === String(parsed.conflictingMemoryId)
      );

      return {
        hasConflict: true,
        conflictingMemory: conflictingDoc || relevantMemories[0],
        reason: parsed.reason,
        recommendedAction: parsed.recommendedAction,
      };
    }

    return { hasConflict: false, conflictingMemories: [] };
  } catch (err) {
    console.error('[Memory Engine] Conflict detection error:', err.message);
    return { hasConflict: false, conflictingMemories: [] };
  }
}

/**
 * 4b. MEMORY CORRECTION / SUPERSEDING
 * Safely deprecates an old memory, creates the new memory, and links them.
 */
async function supersedeMemory(oldMemoryId, newMemoryData) {
  const oldMemory = await Memory.findById(oldMemoryId);
  if (!oldMemory) {
    throw new Error(`Memory with ID ${oldMemoryId} not found.`);
  }

  // Save the new memory first
  const newMemory = await saveMemory(newMemoryData);

  // Mark old memory as deprecated and link to the replacement
  oldMemory.status = 'deprecated';
  oldMemory.superseded_by = newMemory._id;
  await oldMemory.save();

  return {
    deprecatedMemory: oldMemory,
    activeMemory: newMemory,
  };
}

/**
 * 5. CONTEXT-AWARE Q&A
 * Answers user questions by grounding responses strictly in retrieved team memories.
 * Cites sources and displays which memories influenced the answer.
 */
async function askQuestion(question, workspace = 'default') {
  if (!question || question.trim().length === 0) {
    throw new Error('Question cannot be empty.');
  }

  // 1. Retrieve the most relevant memories
  const relevantMemories = await retrieveMemories(question, workspace, 4);

  // 2. Prepare memory context string
  let contextSnippet = 'No relevant team memories found in database.';
  if (relevantMemories.length > 0) {
    contextSnippet = relevantMemories
      .map(
        (m, idx) =>
          `[Memory #${idx + 1}] Title: "${m.title}" | Category: ${m.category} | Logged by: ${m.source} | Date: ${new Date(
            m.createdAt
          ).toLocaleDateString()}\nDetails: ${m.content}`
      )
      .join('\n\n');
  }

  const prompt = `
You are KnowBridge, the persistent knowledge assistant for our engineering team.
Answer the user's question using the retrieved team memories provided below.

Rules:
1. ALWAYS prioritize facts and decisions documented in the Team Memories.
2. If a past team decision addresses the question, state it explicitly and name the source/author.
3. Clearly distinguish between verified team decisions and general programming assumptions.
4. If no relevant team decision exists in memory, state that honestly and provide a standard best-practice suggestion with a disclaimer.

Retrieved Team Memories:
${contextSnippet}

User Question:
"${question}"
`;

  const answer = await generateText(
    prompt,
    'You are KnowBridge, an authoritative and transparent engineering team memory assistant.'
  );

  return {
    question,
    answer,
    memoriesCited: relevantMemories.map((m) => ({
      id: m._id,
      title: m.title,
      category: m.category,
      source: m.source,
      relevanceScore: m.score,
    })),
  };
}

module.exports = {
  extractMemories,
  saveMemory,
  retrieveMemories,
  detectConflict,
  supersedeMemory,
  askQuestion,
  cosineSimilarity,
};
