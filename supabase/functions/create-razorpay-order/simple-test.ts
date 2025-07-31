// Simple test script to verify Razorpay API connection
const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + btoa('rzp_test_qnrr4eJ9O4Qys:OEjkhPYGk5c4MQZ2PpAJh7Tz')
  }
});

if (!response.ok) {
  console.error('Error status:', response.status);
  console.error('Error status text:', response.statusText);
  const error = await response.text();
  console.error('Error details:', error);
  throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();
console.log('Razorpay API response:', JSON.stringify(data, null, 2));
