// Simple test script to verify Razorpay API connection
import Razorpay from 'https://esm.sh/razorpay@2.8.6';

const razorpay = new Razorpay.default({
  key_id: 'rzp_test_qnrr4eJ9O4Qys',
  key_secret: 'OEjkhPYGk5c4MQZ2PpAJh7Tz'
});

async function testRazorpay() {
  try {
    console.log('Testing Razorpay connection...');
    
    // Test API key by making a simple request
    const payments = await razorpay.payments.all({ count: 1 });
    console.log('Razorpay connection successful!');
    console.log('Latest payment:', payments.items[0]);
    
  } catch (error) {
    console.error('Error testing Razorpay:');
    if (error.isAxiosError) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    } else {
      console.error(error);
    }
  }
}

testRazorpay().catch(console.error);
