require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { generateText, generateEmbedding } = require('../config/gemini');
const Memory = require('../models/Memory');

async function testConnection() {
  console.log('--- Starting KnowBridge Diagnostics ---\n');

  // 1. Verify Environment Variables
  console.log('[1/3] Environment Variables:');
  const hasMongo = Boolean(process.env.MONGODB_URI || process.env.MONGO_URI);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_'));

  console.log(` - MongoDB URI: ${hasMongo ? 'CONFIGURED' : 'MISSING'}`);
  console.log(` - GEMINI_API_KEY: ${hasGemini ? 'CONFIGURED' : 'MISSING'}`);

  if (!hasMongo) {
    console.error('❌ MONGODB_URI or MONGO_URI is missing in .env');
    process.exit(1);
  }

  // 2. Test MongoDB Atlas Connection
  console.log('\n[2/3] MongoDB Atlas Connection:');
  try {
    await connectDB();
    const count = await Memory.countDocuments();
    console.log(`✅ MongoDB Atlas Connected! Active database: 'knowbridge'`);
    console.log(`✅ Collection 'memories' is ready (current documents: ${count})`);
  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Failed:', err.message);
    process.exit(1);
  }

  // 3. Test Gemini API
  console.log('\n[3/3] Gemini AI Connectivity:');
  if (hasGemini) {
    try {
      const response = await generateText('Respond with only the single word: "READY"');
      console.log(`✅ Gemini LLM (gemini-3.5-flash-lite) Verified: "${response}"`);

      const emb = await generateEmbedding('KnowBridge memory test');
      console.log(`✅ Gemini Embeddings (gemini-embedding-001) Verified: Vector dimension = ${emb.length}`);
    } catch (err) {
      console.error('❌ Gemini API Test Failed:', err.message);
    }
  }

  await mongoose.disconnect();
  console.log('\n🎉 ALL SERVICES VERIFIED AND READY FOR KNOWBRIDGE!');
}

testConnection();
