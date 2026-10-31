require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate text response using Google Gemini
 * Default model: 'gemini-3.5-flash-lite' (fast, robust, supported by your key)
 */
async function generateText(prompt, systemInstruction = '') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const url = `${BASE_URL}/gemini-3.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`[Gemini API Error] ${data.error.message || JSON.stringify(data.error)}`);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('[Gemini API] No response candidates returned.');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

/**
 * Generate 3072-dimensional vector embedding for text
 * Model: 'gemini-embedding-001'
 */
async function generateEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const url = `${BASE_URL}/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: {
        parts: [{ text }],
      },
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`[Gemini Embedding Error] ${data.error.message || JSON.stringify(data.error)}`);
  }

  if (!data.embedding || !data.embedding.values) {
    throw new Error('[Gemini Embedding] No embedding vector returned.');
  }

  return data.embedding.values;
}

module.exports = {
  generateText,
  generateEmbedding,
};
