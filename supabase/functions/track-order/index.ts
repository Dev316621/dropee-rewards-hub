import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller identity
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    const { integration_id, order_id } = await req.json();
    if (!integration_id || !order_id) {
      return new Response(JSON.stringify({ error: "Missing integration_id or order_id" }), { status: 400, headers: corsHeaders });
    }

    // Fetch integration config
    const { data: integration, error: intErr } = await adminClient.from("api_integrations").select("*").eq("id", integration_id).single();
    if (intErr || !integration) {
      return new Response(JSON.stringify({ error: "Integration not found" }), { status: 404, headers: corsHeaders });
    }

    // Fetch order
    const { data: order, error: ordErr } = await adminClient.from("tracked_orders").select("*").eq("id", order_id).single();
    if (ordErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });
    }

    // Build request to external API
    const url = `${integration.base_url}/${order.external_order_id}`;
    const headers: Record<string, string> = {};
    if (integration.api_key_encrypted) {
      headers["Authorization"] = `Bearer ${integration.api_key_encrypted}`;
    }
    if (integration.headers_json && typeof integration.headers_json === "object") {
      Object.assign(headers, integration.headers_json);
    }

    let responseData: any = null;
    let newStatus = order.status;

    try {
      const extRes = await fetch(url, { headers, method: "GET" });
      responseData = await extRes.json();
      newStatus = responseData?.status || responseData?.tracking_status || responseData?.state || order.status;
    } catch (fetchErr: any) {
      responseData = { error: fetchErr.message, raw: "Failed to fetch external API" };
    }

    // Update tracked order
    await adminClient.from("tracked_orders").update({
      last_response: responseData,
      status: String(newStatus),
      last_checked_at: new Date().toISOString(),
    }).eq("id", order_id);

    return new Response(JSON.stringify({ success: true, status: newStatus, response: responseData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
