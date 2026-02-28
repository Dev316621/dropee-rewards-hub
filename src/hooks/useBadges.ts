import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useBadges = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const allBadges = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*").order("condition_value");
      if (error) throw error;
      return data ?? [];
    },
  });

  const earnedBadges = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const earnedIds = new Set((earnedBadges.data ?? []).map((ub) => ub.badge_id));

  return { allBadges, earnedBadges, earnedIds };
};
