import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardData = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const pointsBalance = useQuery({
    queryKey: ["points-balance", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_points_balance", {
        _user_id: userId!,
      });
      if (error) throw error;
      return (data as number) ?? 0;
    },
    enabled: !!userId,
  });

  const deliveryCount = useQuery({
    queryKey: ["delivery-count", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_delivery_count", {
        _user_id: userId!,
      });
      if (error) throw error;
      return (data as number) ?? 0;
    },
    enabled: !!userId,
  });

  const userTier = useQuery({
    queryKey: ["user-tier", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_tier", {
        _user_id: userId!,
      });
      if (error) throw error;
      return data?.[0] ?? { tier_name: "Starter", tier_badge: "bronze" };
    },
    enabled: !!userId,
  });

  const tiers = useQuery({
    queryKey: ["tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const freeCredits = useQuery({
    queryKey: ["free-credits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("free_delivery_credits")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const totalFees = useQuery({
    queryKey: ["total-fees", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("fee")
        .eq("user_id", userId!)
        .eq("status", "completed");
      if (error) throw error;
      return data?.reduce((sum, d) => sum + (Number(d.fee) || 0), 0) ?? 0;
    },
    enabled: !!userId,
  });

  return {
    profile,
    pointsBalance,
    deliveryCount,
    userTier,
    tiers,
    freeCredits,
    totalFees,
  };
};
