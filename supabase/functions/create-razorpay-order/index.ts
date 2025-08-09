import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Razorpay from 'https://esm.sh/razorpay@2.9.2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // We are ignoring the cart for now and using a fixed amount for debugging
    const totalAmount = 1000 // Test amount: ₹10

    console.log("Function invoked. Initializing Razorpay...")

    // This is a critical check. If keys are missing, the function will fail fast.
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay API keys are not configured in function secrets.")
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })
    
    console.log("Razorpay initialized. Attempting to create order...")

    const options = {
      amount: totalAmount, // Amount in paise
      currency: 'INR',
      receipt: `receipt_test_${new Date().getTime()}`,
    }

    const order = await razorpay.orders.create(options)
    
    console.log("Razorpay order created successfully:", order.id)

    if (!order) {
        throw new Error("Razorpay order creation returned an empty response.")
    }

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
    // This provides a detailed log of the exact failure point.
    console.error(`CRITICAL ERROR in create-razorpay-order: ${errorMessage}`)
    return new Response(JSON.stringify({ error: `Razorpay API Error: ${errorMessage}` }), {
      status: 400, // Use 400 to indicate a client or configuration error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})