import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

// This interface should match the items you expect in your cart
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

class RazorpayClient {
  async checkout(
    cart: CartItem[],
    customerDetails: { name: string; email: string; contact: string }
  ): Promise<{ success: boolean; message?: string; orderId?: string }> {
    
    if (!cart || cart.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    try {
      // 1. Call the Supabase Edge Function to create a Razorpay order
      // The 'body' object is crucial. It must contain a 'cart' property.
      const { data: order, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          cart,
        },
      });

      if (error) {
        throw new Error(`Edge Function returned a non-2xx status code: ${error.message}`);
      }
      
      if (!order || !order.id) {
        throw new Error('Failed to create Razorpay order. Invalid response from server.');
      }

      // 2. Open the Razorpay checkout URL
      // We use your Razorpay Key ID, which is safe to expose on the client
      const razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
      
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'AquaKart',
        description: 'Water Delivery Service',
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.contact,
        },
        theme: {
          color: '#4F46E5', // Your app's theme color
        },
      };

      // This URL construction is for opening the checkout in a web browser
      const checkoutUrl = `https://api.razorpay.com/v1/checkout.html?options=${encodeURIComponent(JSON.stringify(options))}`;
      
      const browserResult = await WebBrowser.openBrowserAsync(checkoutUrl);

      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
        return { success: false, message: 'Payment was cancelled.', orderId: order.id };
      }

      // Optimistic success response.
      // You should always verify the final payment status using Razorpay Webhooks.
      return { success: true, message: 'Payment processing.', orderId: order.id };

    } catch (error: any) {
      console.error('Razorpay checkout error:', error);
      Alert.alert('Checkout Error', error.message || 'An unknown error occurred during checkout.');
      return { success: false, message: error.message };
    }
  }
}

export const razorpayClient = new RazorpayClient();