// Simple test to verify role endpoint works
const fetch = require('node-fetch');

async function testRoleEndpoint() {
  try {
    console.log('Testing GET /api/roles...');
    const response = await fetch('http://localhost:5000/api/roles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ GET endpoint works!');
    } else {
      console.log('❌ GET endpoint failed');
    }

    // Test POST
    console.log('\nTesting POST /api/roles...');
    const postResponse = await fetch('http://localhost:5000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Role',
        description: 'This is a test role',
        isActive: true
      })
    });

    const postData = await postResponse.json();
    console.log('Response status:', postResponse.status);
    console.log('Response data:', JSON.stringify(postData, null, 2));

    if (postResponse.ok) {
      console.log('✅ POST endpoint works!');
    } else {
      console.log('❌ POST endpoint failed');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testRoleEndpoint();
