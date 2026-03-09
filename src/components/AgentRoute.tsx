import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AgentRoute = () => {
  const { user, isLoading } = useAuth();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agent-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_delivery_agents")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "approved")
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading || agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/agent/login" replace />;
  }

  if (!agent) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ agent }} />;
};

export default AgentRoute;
