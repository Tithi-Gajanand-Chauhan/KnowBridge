// scripts/test_mocked_ai_flow.js
// Mocked Unit Test Suite for KnowBridge AI Memory Engine
// =====================================================================
// NOTE: This test runs completely offline without contacting external services.
// It intercepts global.fetch and Mongoose DB queries with simulated responses
// to verify that:
// 1. config/gemini.js generates proper payloads and handles responses.
// 2. services/memoryEngine.js extracts and parses memories properly.
// 3. Vector cosine similarity and retrieval calculate accurately.
// 4. Q&A prompts structure memories and cite references properly.
// =====================================================================

const assert = require('assert');
const Memory = require('../models/Memory');
const memoryEngine = require('../services/memoryEngine');

async function runMockedTests() {
  console.log('====================================================');
  console.log('🤖 KNOWBRIDGE MOCKED AI ENGINE TEST SUITE (OFFLINE)');
  console.log('====================================================');
  console.log('ℹ️  This test uses mocked fetch & in-memory documents');
  console.log('   to test Gemini & Memory Engine logic end-to-end');
  console.log('   WITHOUT contacting Google or MongoDB Atlas.\n');

  // Provide a temporary mock API key so config/gemini.js does not abort
  process.env.GEMINI_API_KEY = 'mock_test_key_for_unit_tests';

  const originalFetch = global.fetch;
  const originalAggregate = Memory.aggregate;
  const originalFind = Memory.find;

  try {
    // ----------------------------------------------------
    // TEST 1: Vector Cosine Similarity Algorithm
    // ----------------------------------------------------
    console.log('🧪 Test 1: Testing Cosine Similarity Algorithm...');
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    const simIdentical = memoryEngine.cosineSimilarity(vecA, vecB);
    const simOrthogonal = memoryEngine.cosineSimilarity(vecA, vecC);

    assert.strictEqual(simIdentical, 1, 'Identical vectors should have similarity of 1');
    assert.strictEqual(simOrthogonal, 0, 'Orthogonal vectors should have similarity of 0');
    console.log('   ✅ PASS: Cosine similarity algorithm calculated accurately (1.0 for identical, 0.0 for orthogonal).\n');

    // ----------------------------------------------------
    // TEST 2: Memory Extraction Flow via Mocked fetch()
    // ----------------------------------------------------
    console.log('🧪 Test 2: Testing extractMemories() via Mocked Gemini API...');
    const mockDecisions = [
      {
        title: 'Adopt PostgreSQL for ACID auth',
        content: 'Chose PostgreSQL over MongoDB specifically for authentication transactions.',
        category: 'technical_decision',
        source: 'Alex (Tech Lead)',
        tags: ['postgresql', 'database', 'auth'],
        expires_at: null
      }
    ];

    global.fetch = async (url) => {
      // Simulate Gemini generateContent response
      return {
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '```json\n' + JSON.stringify(mockDecisions) + '\n```'
                  }
                ]
              }
            }
          ]
        })
      };
    };

    const conversation = `
      Alex: We decided on PostgreSQL for the auth service because of strict ACID requirements.
      Dev: Makes sense. Let's start the schema.
    `;

    const extracted = await memoryEngine.extractMemories(conversation, 'Alex');
    assert.strictEqual(Array.isArray(extracted), true);
    assert.strictEqual(extracted.length, 1);
    assert.strictEqual(extracted[0].title, 'Adopt PostgreSQL for ACID auth');
    assert.strictEqual(extracted[0].category, 'technical_decision');
    console.log('   ✅ PASS: extractMemories() called config/gemini.js, stripped markdown, and parsed decision.\n');

    // ----------------------------------------------------
    // TEST 3: Grounded Q&A Flow with Mocked DB & Embeddings
    // ----------------------------------------------------
    console.log('🧪 Test 3: Testing askQuestion() Q&A prompt and citations...');

    // Mock in-memory database response
    Memory.aggregate = async () => [];
    Memory.find = () => ({
      select: async () => [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Adopt PostgreSQL for Auth',
          content: 'Chose PostgreSQL for strict ACID compliance.',
          category: 'technical_decision',
          source: 'Alex (Tech Lead)',
          workspace: 'default',
          status: 'active',
          tags: ['postgresql'],
          createdAt: new Date(),
          embedding: new Array(3072).fill(0.01)
        }
      ]
    });

    global.fetch = async (url) => {
      if (url.includes('embedContent')) {
        // Return simulated 3072-dimensional vector embedding
        return {
          json: async () => ({
            embedding: {
              values: new Array(3072).fill(0.01)
            }
          })
        };
      }
      // Return simulated grounded response
      return {
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'Based on past team decisions by Alex (Tech Lead), PostgreSQL was selected for strict ACID compliance.'
                  }
                ]
              }
            }
          ]
        })
      };
    };

    const qResult = await memoryEngine.askQuestion('Why did we choose PostgreSQL?');
    assert.strictEqual(qResult.question, 'Why did we choose PostgreSQL?');
    assert(qResult.answer.includes('PostgreSQL'));
    assert(Array.isArray(qResult.memoriesCited));
    assert.strictEqual(qResult.memoriesCited.length, 1);
    assert.strictEqual(qResult.memoriesCited[0].title, 'Adopt PostgreSQL for Auth');
    console.log('   ✅ PASS: askQuestion() generated embedding, retrieved in-memory context, and returned citations.\n');

    console.log('====================================================');
    console.log('🎉 ALL 3 MOCKED AI ENGINE TESTS PASSED (100%)');
    console.log('====================================================');
  } finally {
    global.fetch = originalFetch;
    Memory.aggregate = originalAggregate;
    Memory.find = originalFind;
    delete process.env.GEMINI_API_KEY;
  }
}

runMockedTests().catch((err) => {
  console.error('Mocked Test Failure:', err);
  process.exit(1);
});
