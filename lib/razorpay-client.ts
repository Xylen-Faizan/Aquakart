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
  /**
   * Handles the checkout process by creating a Razorpay order via a Supabase Edge Function
   * and opening the checkout URL in an in-app browser.
   */
  async checkout(
    cart: CartItem[],
    customerDetails: { name: string; email: string; contact: string }
  ): Promise<{ success: boolean; message?: string; orderId?: string; paymentId?: string }> {

    if (!cart || cart.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    try {
      // 1. Call the Supabase Edge Function to create a Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          cart,
          customerDetails,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.id || !data.checkout_url) {
        throw new Error('Failed to create Razorpay order. Invalid response from server.');
      }

      const orderId = data.id;
      const checkoutUrl = data.checkout_url;

      // 2. Open the Razorpay checkout URL using expo-web-browser
      const browserResult = await WebBrowser.openBrowserAsync(checkoutUrl);

      // 3. Handle the browser result (this part is simplified)
      // In a real app, you would use a callback URL and deep linking to verify the payment status.
      // For now, we'll assume a closed browser means a completed or cancelled payment.
      // You should verify payment status on your backend using webhooks.
      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
        return {
          success: false,
          message: 'Payment was cancelled or dismissed.',
          orderId,
        };
      }

      // At this point, you can't be 100% sure the payment was successful without a webhook.
      // This is an optimistic success response.
      Alert.alert(
        'Payment Processing',
        'Your payment is being processed. You will be notified once confirmed.'
      );

      return {
        success: true,
        message: 'Payment process initiated.',
        orderId,
      };

    } catch (error: any) {
      console.error('Razorpay checkout error:', error);
      Alert.alert('Checkout Error', error.message || 'An unknown error occurred during checkout.');
      return { success: false, message: error.message };
    }
  }
}

export const razorpayClient = new RazorpayClient();