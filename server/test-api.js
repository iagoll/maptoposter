/**
 * Simple test script to verify the API endpoints
 * Run with: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Test SSE connection
function testSSE(jobId) {
  return new Promise((resolve) => {
    console.log('\n📡 Testing SSE connection...');
    
    const url = new URL(`/api/logs/${jobId}`, BASE_URL);
    const req = http.request(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers['content-type']);
      
      let eventCount = 0;
      res.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        lines.forEach(line => {
          if (line.startsWith('data:')) {
            eventCount++;
            const data = JSON.parse(line.substring(5).trim());
            console.log(`   Event ${eventCount}:`, data.type, data.message ? `"${data.message.substring(0, 50)}..."` : '');
            
            // Close after receiving complete event
            if (data.type === 'complete' || data.type === 'error') {
              req.destroy();
              resolve(data);
            }
          }
        });
      });
      
      res.on('end', () => resolve(null));
    });
    
    req.on('error', (error) => {
      console.error('   ❌ SSE Error:', error.message);
      resolve(null);
    });
    
    req.end();
    
    // Timeout after 2 minutes
    setTimeout(() => {
      req.destroy();
      resolve(null);
    }, 120000);
  });
}

async function runTests() {
  console.log('🧪 Testing Map Poster API\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣  Testing Health Check');
    const health = await request('GET', '/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    
    // Test 2: List Themes
    console.log('\n2️⃣  Testing List Themes');
    const themes = await request('GET', '/api/themes');
    console.log(`   Status: ${themes.status}`);
    console.log(`   Found ${themes.data.length} themes`);
    console.log(`   First theme:`, themes.data[0]);
    
    // Test 3: List Posters
    console.log('\n3️⃣  Testing List Posters');
    const posters = await request('GET', '/api/posters');
    console.log(`   Status: ${posters.status}`);
    console.log(`   Found ${posters.data.length} posters`);
    if (posters.data.length > 0) {
      console.log(`   Latest:`, posters.data[0].filename);
    }
    
    // Test 4: Generate Map (small test)
    console.log('\n4️⃣  Testing Map Generation');
    const generateBody = {
      city: 'Tenerife',
      country: 'Spain',
      theme: 'noir',
      distance: 10000, // Small area for quick test
      orientation: 'vertical'
    };
    console.log(`   Request:`, generateBody);
    
    const generate = await request('POST', '/api/generate', generateBody);
    console.log(`   Status: ${generate.status}`);
    console.log(`   Response:`, generate.data);
    
    if (generate.data.jobId) {
      const jobId = generate.data.jobId;
      
      // Test 5: Check Job Status
      console.log('\n5️⃣  Testing Job Status');
      const jobStatus = await request('GET', `/api/jobs/${jobId}`);
      console.log(`   Status: ${jobStatus.status}`);
      console.log(`   Job Status:`, jobStatus.data.status);
      
      // Test 6: Stream Logs via SSE
      console.log('\n6️⃣  Testing Real-time Logs (SSE)');
      const result = await testSSE(jobId);
      
      if (result && result.type === 'complete') {
        console.log('\n   ✅ Generation completed successfully!');
        console.log(`   Result:`, result.result);
        
        // Test 7: Verify file is accessible
        if (result.result && result.result.url) {
          console.log('\n7️⃣  Testing Static File Access');
          const fileResponse = await request('GET', result.result.url);
          console.log(`   Status: ${fileResponse.status}`);
          console.log(`   Content-Type: ${fileResponse.headers['content-type']}`);
          console.log(`   File Size: ${fileResponse.data.length} bytes`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
