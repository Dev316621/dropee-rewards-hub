import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-completion", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && !profile.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
