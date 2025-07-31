// Import required types
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import Razorpay from 'https://esm.sh/razorpay@2.8.6';

// Enable TypeScript DOM types
declare const Deno: any;
declare const console: Console;

// Define types
interface OrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

interface ErrorResponse {
  error: string;
  details?: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

// Validate environment variables
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('Missing required environment variables: RAZORPAY_KEY_ID and/or RAZORPAY_KEY_SECRET');
  console.error('Please set these environment variables:');
  console.error('$env:RAZORPAY_KEY_ID="your_key_id"');
  console.error('$env:RAZORPAY_KEY_SECRET="your_key_secret"');
  Deno.exit(1);
}

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Main handler function
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData: OrderRequest;
    try {
      requestData = await req.json() as OrderRequest;
    } catch (e) {
      return createErrorResponse('Invalid request body', 400);
    }
    
    const { amount, currency = 'INR', receipt, notes } = requestData;

    if (!amount) {
      return createErrorResponse('Amount is required', 400);
    }

 // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return createErrorResponse('Amount must be a positive number', 400);
    }

    // Create order in Razorpay
    console.log('Creating Razorpay order with amount:', amount);
    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: receipt || `order_rcpt_${Date.now()}`,
        notes,
        payment_capture: 1, // Auto-capture payment
      });
      console.log('Razorpay order created:', order);
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      if (error.response) {
        console.error('Razorpay API error:', await error.response.text());
      }
      throw error;
    }

    const response: OrderResponse = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      created_at: order.created_at,
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in request handler:', error);
    
    // Add more detailed error information
    let details = errorMessage;
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return createErrorResponse(
      'Failed to create order',
      500,
      details
    );
  }
}

// Helper function to create error responses
function createErrorResponse(
  error: string, 
  status: number, 
  details?: string
): Response {
  const response: ErrorResponse = { error };
  if (details) response.details = details;
  
  return new Response(
    JSON.stringify(response),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Start the server
const port = parseInt(Deno.env.get('PORT') || '54321');
console.log(`Razorpay Edge Function started on port ${port}`);

await serve(handleRequest, { port });
