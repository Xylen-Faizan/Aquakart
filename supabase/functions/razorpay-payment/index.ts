// Helper to create Razorpay order using fetch
async function createRazorpayOrder({ amount, currency, receipt, notes }: { amount: number; currency: string; receipt?: string; notes?: Record<string, string>; }) {
  const key_id = Deno.env.get('RAZORPAY_KEY_ID')!;
  const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
  const credentials = btoa(`${key_id}:${key_secret}`);

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // paise
      currency,
      receipt,
      notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Razorpay API error: ${errorData}`);
  }

  return await response.json();
}


// Type definitions for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};


// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

// Helper function to log errors consistently
async function logError(error: any, context: string) {
  console.error(`[${new Date().toISOString()}] Error in ${context}:`, JSON.stringify({
    message: error.message,
    name: error.name,
    stack: error.stack,
  }, null, 2));
}

// Main request handler
const handler = async (req: Request) => {
  try {
    console.log('Request received:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (e) {
      await logError(e, 'parsing request body');
      return corsResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const { amount, currency = 'INR', receipt, notes } = requestBody;

    // Validate required environment variables
    const requiredEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !Deno.env.get(varName));
    
    if (missingEnvVars.length > 0) {
      const errorMsg = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
      console.error(errorMsg);
      return corsResponse({ 
        error: 'Server configuration error',
        details: 'missing_environment_variables',
        missingVars: missingEnvVars
      }, 500);
    }

    // Create Razorpay order using REST API
    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt,
      notes,
    });

    // Log successful order creation
    console.log('Razorpay order created:', {
      orderId: order.id,
      amount,
      currency,
      receipt
    });

    // Return order details to client
    return corsResponse(order);

  } catch (error: unknown) {
    await logError(error, 'handler');
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return corsResponse({
      error: errorMessage,
      code: error instanceof Error ? error.name : 'unknown',
      type: 'server_error',
    }, 500);
  }
};

// Start the server when running in Deno
if (typeof Deno !== 'undefined') {
  Deno.serve(handler);
}
