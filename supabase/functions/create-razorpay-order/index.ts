import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

// --- IMPORTANT ---
// Make sure these are set as environment variables in your Supabase function's Secrets tab.
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

interface CartItem {
  id: string;
  price: number;
  quantity: number;
}
// Define a type for the product data we fetch from the database
type ProductPrice = {
  id: string;
  price: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received payload:", JSON.stringify(body, null, 2));

    const { cart } = body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.error("Validation failed: Cart is missing or empty.", body);
      return new Response(JSON.stringify({ error: 'Cart is missing, not an array, or empty.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), { status: 401, headers: corsHeaders });
    }

    const productIds = cart.map((item: CartItem) => item.id);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (productError) throw productError;

    let totalAmount = 0;
    for (const item of cart) {
      // FIX: Explicitly type 'p' to avoid the 'implicit any' error.
      const product = products.find((p: ProductPrice) => p.id === item.id);
      if (!product) throw new Error(`Product with id ${item.id} not found.`);
      totalAmount += product.price * item.quantity;
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Successfully created Razorpay order:", order.id);

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Caught error:", error);
    // FIX: Safely handle the 'unknown' error type in the catch block.
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});