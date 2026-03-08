import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_STATUSES = ["pending", "confirmed", "preparing", "picked_up", "on_the_way", "delivered", "cancelled"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role for DB operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { order_id, new_status, assigned_agent_id } = body;

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current order
    const { data: order, error: fetchErr } = await supabase
      .from("hub_orders")
      .select("id, status")
      .eq("id", order_id)
      .single();

    if (fetchErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, unknown> = {};

    if (new_status) {
      if (!VALID_STATUSES.includes(new_status)) {
        return new Response(JSON.stringify({ error: `Invalid status. Valid: ${VALID_STATUSES.join(", ")}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      updates.status = new_status;
    }

    if (assigned_agent_id !== undefined) {
      updates.assigned_agent_id = assigned_agent_id || null;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: "No updates provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin email for audit
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const changedBy = userData?.user?.email || userId;

    // Update order
    const { error: updateErr } = await supabase
      .from("hub_orders")
      .update(updates)
      .eq("id", order_id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log status change
    if (new_status && new_status !== order.status) {
      await supabase.from("hub_order_status_log").insert({
        order_id,
        old_status: order.status,
        new_status,
        changed_by: changedBy,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
