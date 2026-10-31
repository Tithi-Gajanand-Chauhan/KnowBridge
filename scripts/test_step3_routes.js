// scripts/test_step3_routes.js
// Automated test suite for Step 3: Validates health, route registrations,
// input validations, and error handling for both CRUD and AI endpoints.

const http = require('http');

async function testEndpoint(name, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 KNOWBRIDGE STEP 3 TEST SUITE');
  console.log('====================================================\n');

  const tests = [
    {
      name: '1. Health Check Endpoint',
      path: '/api/health',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => res.data && res.data.success === true && res.data.message === 'KnowBridge backend is running'
    },
    {
      name: '2. 404 Route Not Found Handler',
      path: '/api/nonexistent-route',
      method: 'GET',
      expectedStatus: 404,
      validate: (res) => res.data && res.data.success === false
    },
    {
      name: '3. Extract Memories Validation (missing text)',
      path: '/api/memories/extract',
      method: 'POST',
      body: {},
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('text')
    },
    {
      name: '4. Check Conflict Validation (missing content)',
      path: '/api/memories/check-conflict',
      method: 'POST',
      body: { title: 'Test Title' },
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('content')
    },
    {
      name: '5. Supersede Validation (invalid MongoDB ObjectId)',
      path: '/api/memories/not-a-valid-id-123/supersede',
      method: 'PUT',
      body: { content: 'Replacement content' },
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('Invalid memory ID format')
    },
    {
      name: '6. Supersede Validation (missing replacement content)',
      path: '/api/memories/507f1f77bcf86cd799439011/supersede',
      method: 'PUT',
      body: {},
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('Content is required')
    },
    {
      name: '7. Direct Chat Endpoint Validation (missing question)',
      path: '/api/chat',
      method: 'POST',
      body: {},
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('question')
    },
    {
      name: '8. Memory Chat Endpoint Alias Validation (missing question)',
      path: '/api/memories/chat',
      method: 'POST',
      body: {},
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('question')
    },
    {
      name: '9. CRUD Create Validation (missing required content)',
      path: '/api/memories',
      method: 'POST',
      body: {},
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('Content is required')
    },
    {
      name: '10. CRUD Get One Validation (invalid ObjectId)',
      path: '/api/memories/invalid-id-xyz',
      method: 'GET',
      expectedStatus: 400,
      validate: (res) => res.data && res.data.success === false && res.data.message.includes('Invalid memory ID format')
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await testEndpoint(t.name, t.path, t.method, t.body);
      const statusMatch = res.status === t.expectedStatus;
      const dataValid = t.validate ? t.validate(res) : true;

      if (statusMatch && dataValid) {
        console.log(`✅ PASS: ${t.name} (HTTP ${res.status})`);
        passed++;
      } else {
        console.error(`❌ FAIL: ${t.name}`);
        console.error(`   Expected HTTP ${t.expectedStatus}, got ${res.status}`);
        console.error(`   Response:`, res.data || res.raw);
        failed++;
      }
    } catch (err) {
      console.error(`❌ ERROR: ${t.name} failed with network/server error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed out of ${tests.length} tests.`);
  console.log('====================================================');
}

runTestSuite();
