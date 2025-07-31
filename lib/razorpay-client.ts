import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';
import { CartItem } from '@/app/(customer)/index';
import { RazorpayService } from '@/src/services/razorpay';

// Get the Razorpay service instance
const razorpayService = RazorpayService.getInstance();

// Define payment response types
interface PaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentErrorResponse {
  code: string;
  description: string;
  metadata?: {
    payment_id?: string;
    order_id?: string;
  };
}

type PaymentResult = PaymentSuccessResponse | PaymentErrorResponse;

interface CheckoutResult {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
}

export const razorpayClient = {
  async checkout(cart: CartItem[]): Promise<CheckoutResult> {
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      };
    }

    try {
      // Calculate total amount
      const total = parseFloat(
        cart
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)
      );

      // Create order on server
      const order = await razorpayService.createOrder({
        amount: total,
        receipt: `order_${Date.now()}`,
        notes: {
          items: JSON.stringify(cart),
          user: 'user_id', // In a real app, get from auth context
          timestamp: new Date().toISOString(),
        },
      });

      // Prepare Razorpay options
      const options = razorpayService.getPaymentOptions(
        order.orderId,
        total,
        `Order for ${cart.length} item${cart.length > 1 ? 's' : ''}`
      );

      // Open Razorpay checkout
      // Open Razorpay checkout with proper typing
      const result = await RazorpayCheckout.open(options) as PaymentResult;

      // Handle payment result
      if ('razorpay_payment_id' in result) {
        // Payment successful
        const { razorpay_payment_id, razorpay_order_id } = result;
        
        // Verify and process the payment
        const verification = await razorpayService.handlePaymentSuccess(
          razorpay_payment_id,
          razorpay_order_id
        );

        return {
          success: true,
          message: verification.message,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        };
      } else {
        // Payment failed or was canceled
        const { code, description } = result;
        console.error('Razorpay payment failed:', { code, description });
        
        return {
          success: false,
          message: `Payment failed: ${description || 'Unknown error'}`,
        };
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to process your order. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network request failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('Payment cancelled')) {
          errorMessage = 'Payment was cancelled.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};
