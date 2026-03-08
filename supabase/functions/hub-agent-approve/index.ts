import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { agent_id, action, password, email } = await req.json();

    if (!agent_id || !action) {
      return new Response(JSON.stringify({ error: "agent_id and action required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      const { error } = await adminClient
        .from("hub_delivery_agents")
        .update({ status: "rejected", is_active: false })
        .eq("id", agent_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: "Application rejected." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "approve") {
      // Get agent data
      const { data: agent, error: fetchError } = await adminClient
        .from("hub_delivery_agents")
        .select("*")
        .eq("id", agent_id)
        .single();

      if (fetchError || !agent) {
        return new Response(JSON.stringify({ error: "Agent not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const agentEmail = email || agent.email;
      if (!agentEmail || !password) {
        return new Response(JSON.stringify({ error: "email and password required to approve" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth account
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: agentEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: agent.name, phone: agent.phone || "", role: "agent" },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update agent record
      const { error: updateError } = await adminClient
        .from("hub_delivery_agents")
        .update({
          status: "approved",
          is_active: true,
          email: agentEmail,
          user_id: newUser.user.id,
        })
        .eq("id", agent_id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        message: `Agent approved. Login credentials sent to ${agentEmail}.`,
        user_id: newUser.user.id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create") {
      // Admin manually creates a new agent
      const { name, phone, agentEmail, agentPassword } = await req.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: "Use approve action with agent_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
