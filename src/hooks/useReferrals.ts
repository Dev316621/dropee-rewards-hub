import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useReferrals = () => {
  const { user } = useAuth();

  const referrals = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const referralPointsEarned = useQuery({
    queryKey: ["referral-points", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_points_log")
        .select("amount")
        .eq("user_id", user!.id)
        .eq("source", "referral");
      if (error) throw error;
      return data?.reduce((sum, r) => sum + r.amount, 0) ?? 0;
    },
    enabled: !!user?.id,
  });

  return {
    referrals: referrals.data ?? [],
    referralCount: referrals.data?.length ?? 0,
    referralPointsEarned: referralPointsEarned.data ?? 0,
    isLoading: referrals.isLoading,
  };
};
