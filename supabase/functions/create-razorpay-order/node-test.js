// Simple Node.js test script to verify Razorpay API connection
const https = require('https');

const keyId = 'rzp_test_qnrr4eJ9O4Qys';
const keySecret = 'OEjkhPYGk5c4MQZ2PpAJh7Tz';
const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

const options = {
  hostname: 'api.razorpay.com',
  port: 443,
  path: '/v1/payments?count=1',
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  }
};

console.log('Testing Razorpay API connection...');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
  
  // Log raw response headers
  console.log('Raw Response Headers:');
  console.log(res.rawHeaders.join('\n'));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response Body:');
      console.log(JSON.stringify(result, null, 2));
      
      // Write response to file for inspection
      const fs = require('fs');
      fs.writeFileSync('razorpay-response.json', JSON.stringify({
        statusCode: res.statusCode,
        headers: res.headers,
        body: result
      }, null, 2));
      console.log('Full response saved to razorpay-response.json');
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
