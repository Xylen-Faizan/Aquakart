import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleRequest } from './index.ts';

// Test the function locally
const testRequest = new Request('http://localhost:54321', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100, // 1.00 INR
    currency: 'INR',
    receipt: `test_${Date.now()}`,
    notes: {
      description: 'Test payment'
    }
  })
});

// Handle the test request
handleRequest(testRequest)
  .then(async (response) => {
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', await response.text());
  })
  .catch(console.error);
