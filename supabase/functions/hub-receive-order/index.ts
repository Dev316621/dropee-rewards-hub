import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // GET — poll order status
    if (req.method === "GET") {
      const url = new URL(req.url);
      const hubOrderId = url.searchParams.get("hub_order_id");
      if (!hubOrderId) {
        return new Response(JSON.stringify({ error: "hub_order_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("hub_orders")
        .select("id, status, updated_at, assigned_agent_id")
        .eq("id", hubOrderId)
        .single();
      if (error || !data) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST — receive new order
    if (req.method === "POST") {
      const apiKey = req.headers.get("x-api-key");
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate API key
      const { data: website, error: wErr } = await supabase
        .from("hub_websites")
        .select("id, name, is_active")
        .eq("api_key", apiKey)
        .single();

      if (wErr || !website) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!website.is_active) {
        return new Response(JSON.stringify({ error: "Website is deactivated" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { external_order_id, customer_name, customer_phone, customer_address, items, total, notes } = body;

      if (!customer_name || !items || !Array.isArray(items)) {
        return new Response(JSON.stringify({ error: "customer_name and items[] are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: order, error: insertErr } = await supabase
        .from("hub_orders")
        .insert({
          website_id: website.id,
          external_order_id: external_order_id || "",
          customer_name: customer_name || "",
          customer_phone: customer_phone || "",
          customer_address: customer_address || "",
          items,
          total: total || 0,
          notes: notes || "",
          status: "pending",
        })
        .select("id")
        .single();

      if (insertErr) {
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log initial status
      await supabase.from("hub_order_status_log").insert({
        order_id: order.id,
        old_status: null,
        new_status: "pending",
        changed_by: `api:${website.name}`,
      });

      return new Response(JSON.stringify({ hub_order_id: order.id, status: "pending" }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
