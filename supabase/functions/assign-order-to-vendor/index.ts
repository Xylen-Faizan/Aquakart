// The 'Cannot find module' errors will be resolved by your new deno.jsonc config.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
};

// FIX: Give 'req' an explicit type of 'Request'
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, productIds } = await req.json();
    if (!orderId || !productIds || productIds.length === 0) {
      throw new Error("Order ID and Product IDs are required.");
    }

    // FIX: The 'Cannot find name Deno' error will be resolved by your new deno.jsonc config.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: availableVendors, error: vendorError } = await supabaseAdmin.rpc(
        'get_vendors_for_products', 
        { p_product_ids: productIds }
    );

    if (vendorError) throw vendorError;

    if (!availableVendors || availableVendors.length === 0) {
      await supabaseAdmin.from('orders').update({ status: 'assignment_failed' }).eq('id', orderId);
      throw new Error("No single vendor can fulfill the entire order.");
    }
    
    const assignedVendor = availableVendors[0];

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        vendor_id: assignedVendor.id, 
        status: 'awaiting_acceptance'
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;
    
    console.log(`Order ${orderId} assigned to vendor ${assignedVendor.name} (${assignedVendor.id})`);

    return new Response(JSON.stringify({ success: true, assignedVendor, updatedOrder }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // FIX: Safely handle the 'unknown' error type
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})