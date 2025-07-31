declare module 'https://esm.sh/razorpay@2.8.6' {
  interface RazorpayOrder {
    amount: number;
    currency: string;
    receipt: string;
    id: string;
    status: string;
    created_at: number;
  }

  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: {
      create(order: {
        amount: number;
        currency: string;
        receipt: string;
        notes?: Record<string, string>;
        payment_capture: number;
      }): Promise<RazorpayOrder>;
    };
  }

  export default Razorpay;
}

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}
