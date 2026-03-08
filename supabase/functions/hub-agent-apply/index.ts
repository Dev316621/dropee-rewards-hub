import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate API key from the requesting hub website
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify this API key belongs to a registered hub website
    const { data: website, error: websiteError } = await adminClient
      .from("hub_websites")
      .select("id, name, is_active")
      .eq("api_key", apiKey)
      .single();

    if (websiteError || !website || !website.is_active) {
      return new Response(JSON.stringify({ error: "Invalid or inactive API key" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, phone, email } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "name and email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if an agent with same email already applied
    const { data: existing } = await adminClient
      .from("hub_delivery_agents")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        message: existing.status === "pending"
          ? "An application with this email is already pending review."
          : "An agent account with this email already exists.",
      }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: agent, error: insertError } = await adminClient
      .from("hub_delivery_agents")
      .insert({
        name: name.trim(),
        phone: (phone || "").trim(),
        email: email.toLowerCase().trim(),
        status: "pending",
        is_active: false,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Application submitted successfully. You will be notified once approved.",
      application_id: agent.id,
    }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
