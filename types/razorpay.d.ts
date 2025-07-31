declare module '@razorpay/react-native-razorpay' {
  export interface PaymentData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface PaymentError {
    code: string;
    description: string;
  }

  export interface PaymentOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    theme?: {
      color?: string;
    };
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
  }

  export interface Razorpay {
    open(options: PaymentOptions): Promise<PaymentData | PaymentError>;
  }

  const Razorpay: Razorpay;
  export default Razorpay;
}
