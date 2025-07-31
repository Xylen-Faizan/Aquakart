import { Alert } from 'react-native';

// Define interfaces for Razorpay integration
export interface PaymentRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: string[];
  created_at: number;
  orderId: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  contact?: string; // Alias for phone for compatibility
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  [key: string]: any; // Allow additional properties
}

// Using a simple in-memory store for user profile in this example
// In a real app, you would use SecureStore or your auth context
const userProfileStore: { profile: UserProfile | null } = {
  profile: null,
};

const CURRENCY = 'INR';
const MIN_AMOUNT = 1; // Minimum amount in INR
const MAX_AMOUNT = 100000; // Maximum amount in INR

// RazorpayCheckoutOptions is already defined above

export class RazorpayService {
  private static instance: RazorpayService;
  private readonly RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
  private readonly SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  private userProfile: UserProfile | null = userProfileStore.profile || {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+919876543210',
    contact: '+919876543210',
  };

  private constructor() {
    if (!this.RAZORPAY_KEY) {
      throw new Error('Razorpay key ID is not configured');
    }
    if (!this.SUPABASE_URL) {
      throw new Error('Supabase URL is not configured');
    }
    this.loadUserProfile();
  }

  public static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  private async loadUserProfile() {
    // In a real app, you would load the user profile from secure storage or auth context
    // For this example, we'll use a simple in-memory store
    this.userProfile = userProfileStore.profile;
  }

  private validateAmount(amount: number): void {
    if (isNaN(amount) || amount < MIN_AMOUNT) {
      throw new Error(`Amount must be at least ${MIN_AMOUNT} ${CURRENCY}`);
    }
    if (amount > MAX_AMOUNT) {
      throw new Error(`Amount cannot exceed ${MAX_AMOUNT} ${CURRENCY}`);
    }
  }

  public async createOrder(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { amount, currency = CURRENCY, receipt, notes } = paymentRequest;
      
      // Validate amount
      this.validateAmount(amount);

      const response = await fetch(`${this.SUPABASE_URL}/functions/v1/razorpay-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: receipt || `order_${Date.now()}`,
          notes: notes || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Failed to create order: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as PaymentResponse;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create payment order. Please try again.'
      );
    }
  }

  public getPaymentOptions(orderId: string, amount: number, description: string): RazorpayCheckoutOptions {
    if (!this.RAZORPAY_KEY) {
      throw new Error('Razorpay key is not configured');
    }
    if (!orderId) {
      throw new Error('Order ID is required for payment');
    }

    return {
      key: this.RAZORPAY_KEY,
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: CURRENCY,
      name: 'Water Delivery App',
      description: description || 'Payment for your order',
      order_id: orderId,
      theme: {
        color: '#2563EB', // Using a standard blue color
      },
      prefill: {
        name: this.userProfile?.name || '',
        email: this.userProfile?.email || '',
        contact: this.userProfile?.phone || '',
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          Alert.alert('Payment Cancelled', 'You cancelled the payment.');
        },
      },
    };
  }

  public async handlePaymentSuccess(paymentId: string, orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!paymentId || !orderId) {
        throw new Error('Payment ID and Order ID are required');
      }

      // In a real app, you would verify the payment with your server
      console.log('Payment successful:', { paymentId, orderId });
      
      // Here you would typically:
      // 1. Verify the payment with your backend
      // 2. Update order status in your database
      // 3. Send confirmation email/SMS
      
      return {
        success: true,
        message: 'Payment processed successfully!',
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process payment',
      };
    }
  }
}
