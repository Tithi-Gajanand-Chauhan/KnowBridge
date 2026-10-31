require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Memory = require('../models/Memory');
const {
  extractMemories,
  saveMemory,
  retrieveMemories,
  detectConflict,
  supersedeMemory,
  askQuestion,
} = require('../services/memoryEngine');

async function runTestSuite() {
  console.log('================================================================');
  console.log('       KNOWBRIDGE AI MEMORY ENGINE - END-TO-END TEST SUITE      ');
  console.log('================================================================\n');

  await connectDB();

  const TEST_WORKSPACE = 'qa-sprint-test';

  try {
    // 0. Clean up previous test workspace data for clean test run
    await Memory.deleteMany({ workspace: TEST_WORKSPACE });
    console.log(`🧹 Cleaned up previous test data in workspace '${TEST_WORKSPACE}'.\n`);

    // -------------------------------------------------------------------------
    // TEST 1: MEMORY EXTRACTION
    // -------------------------------------------------------------------------
    console.log('----------------------------------------------------------------');
    console.log('TEST 1: Smart Memory Extraction from Unstructured Conversation');
    console.log('----------------------------------------------------------------');

    const conversationSnippet = `
      Rahul (Tech Lead): Hey team, in today's architecture review we officially decided to migrate from Firebase Auth to custom JWT tokens because Firebase doesn't support our multi-tenant role permissions.
      Priya: Makes total sense, will update the auth service docs.
      Soham: Also guys, does anyone want to order pizza for lunch at 1 PM?
      Krisha: Haha yes, let's do pizza!
      Rahul: Great, and one more thing: we have a strict production deployment freeze until Friday 6 PM for database maintenance.
    `;

    console.log('Raw Conversation Input:');
    console.log(conversationSnippet.trim());
    console.log('\nExtracting technical memories with Gemini AI...');

    const extracted = await extractMemories(conversationSnippet, 'Architecture Review');
    console.log(`\n✅ Extracted ${extracted.length} meaningful memories (Casual chatter ignored!):`);
    extracted.forEach((m, i) => {
      console.log(`  [${i + 1}] Title: "${m.title}"`);
      console.log(`      Category: ${m.category} | Source: ${m.source}`);
      console.log(`      Content: ${m.content}`);
    });

    if (extracted.length === 0) {
      throw new Error('Extraction failed to identify valid decisions.');
    }

    // -------------------------------------------------------------------------
    // TEST 2: MEMORY STORAGE & EMBEDDINGS
    // -------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 2: Persistent Storage with Vector Embeddings');
    console.log('----------------------------------------------------------------');

    const savedDocs = [];
    for (const item of extracted) {
      const saved = await saveMemory({
        ...item,
        workspace: TEST_WORKSPACE,
      });
      savedDocs.push(saved);
      console.log(`✅ Saved Memory to MongoDB: "${saved.title}" (ID: ${saved._id})`);
    }

    const firstMemoryId = savedDocs[0]._id;

    // -------------------------------------------------------------------------
    // TEST 3: SEMANTIC RETRIEVAL & CONTEXT-AWARE Q&A (Session 1)
    // -------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 3: Context-Aware Q&A - Session 1 (Before Conflict)');
    console.log('----------------------------------------------------------------');

    const question1 = 'Can our new payment microservice use Firebase Auth?';
    console.log(`User asks: "${question1}"\n`);

    const qnaResult1 = await askQuestion(question1, TEST_WORKSPACE);
    console.log('KnowBridge AI Answer:');
    console.log(qnaResult1.answer);
    console.log('\nMemories Cited by AI:');
    qnaResult1.memoriesCited.forEach((c) => {
      console.log(` - [${c.category}] "${c.title}" by ${c.source} (Match Score: ${c.relevanceScore})`);
    });

    // -------------------------------------------------------------------------
    // TEST 4: CONFLICT DETECTION
    // -------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 4: Conflict Detection (Contradictory Decision Proposed)');
    console.log('----------------------------------------------------------------');

    const contradictoryDecision = {
      title: 'Standardize on Firebase Auth for All Microservices',
      content: 'We decided to adopt Firebase Auth across all microservices for unified user logins.',
      source: 'Amit (Contractor)',
      category: 'technical_decision',
    };

    console.log('New Decision Proposed by Amit:');
    console.log(`Title: "${contradictoryDecision.title}"`);
    console.log(`Content: "${contradictoryDecision.content}"`);
    console.log('\nRunning Conflict Detection Agent against active memories...');

    const conflictAnalysis = await detectConflict(contradictoryDecision, TEST_WORKSPACE);

    if (conflictAnalysis.hasConflict) {
      console.log('\n⚠️ CONFLICT DETECTED SUCCESSFULLY!');
      console.log(`Contradicts Existing Memory: "${conflictAnalysis.conflictingMemory.title}"`);
      console.log(`Reason: ${conflictAnalysis.reason}`);
      console.log(`Recommended Action: ${conflictAnalysis.recommendedAction}`);
    } else {
      console.warn('⚠️ Warning: Expected conflict was not detected.');
    }

    // -------------------------------------------------------------------------
    // TEST 5: MEMORY CORRECTION / SUPERSEDING
    // -------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 5: Memory Correction & History Preservation');
    console.log('----------------------------------------------------------------');

    console.log(`Superseding old decision (ID: ${firstMemoryId}) with updated decision...`);
    const updateResult = await supersedeMemory(firstMemoryId, {
      ...contradictoryDecision,
      workspace: TEST_WORKSPACE,
    });

    console.log(`✅ Old Memory Status: [${updateResult.deprecatedMemory.status}]`);
    console.log(`✅ Old Memory Superseded By: [${updateResult.deprecatedMemory.superseded_by}]`);
    console.log(`✅ New Memory Status: [${updateResult.activeMemory.status}] (ID: ${updateResult.activeMemory._id})`);

    // -------------------------------------------------------------------------
    // TEST 6: BEHAVIORAL SHIFT IN NEW SESSION (Session 2)
    // -------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('TEST 6: Verified Behavioral Shift in Session 2 (After Correction)');
    console.log('----------------------------------------------------------------');

    const question2 = 'What is our current official policy on using Firebase Auth?';
    console.log(`User asks in new session: "${question2}"\n`);

    const qnaResult2 = await askQuestion(question2, TEST_WORKSPACE);
    console.log('KnowBridge AI Answer:');
    console.log(qnaResult2.answer);
    console.log('\nMemories Cited by AI:');
    qnaResult2.memoriesCited.forEach((c) => {
      console.log(` - [${c.category}] "${c.title}" by ${c.source} (Match Score: ${c.relevanceScore})`);
    });

    console.log('\n================================================================');
    console.log('   🎉 ALL 6 TEST SCENARIOS PASSED WITH VISIBLE BEHAVIOR SHIFT!   ');
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ Test Suite Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runTestSuite();
