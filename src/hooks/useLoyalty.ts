import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useLoyalty = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pointsLog = useQuery({
    queryKey: ["points-log", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_points_log")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const coupons = useQuery({
    queryKey: ["user-coupons", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .or(`assigned_user_id.eq.${user!.id},is_public.eq.true`)
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const redeemPoints = useMutation({
    mutationFn: async () => {
      // Check balance first
      const { data: balance } = await supabase.rpc("get_user_points_balance", {
        _user_id: user!.id,
      });
      if ((balance as number) < 20) throw new Error("Not enough points");

      // Deduct 20 points
      const { error: logError } = await supabase.from("loyalty_points_log").insert({
        user_id: user!.id,
        amount: -20,
        source: "redemption",
        note: "Redeemed 20 points for free delivery",
      });
      if (logError) throw logError;

      // Add free delivery credit
      const { data: credits } = await supabase
        .from("free_delivery_credits")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (credits) {
        const { error: creditError } = await supabase
          .from("free_delivery_credits")
          .update({ total_credits: credits.total_credits + 1 })
          .eq("user_id", user!.id);
        if (creditError) throw creditError;
      }

      // Create notification
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: user!.id,
        type: "reward_redeemed",
        title: "Free Delivery Unlocked! 🎉",
        message: "You redeemed 20 points for a free delivery credit!",
      });
      if (notifError) throw notifError;
    },
    onSuccess: () => {
      toast.success("🎉 Free delivery unlocked!");
      queryClient.invalidateQueries({ queryKey: ["points-balance"] });
      queryClient.invalidateQueries({ queryKey: ["points-log"] });
      queryClient.invalidateQueries({ queryKey: ["free-credits"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to redeem points");
    },
  });

  return {
    pointsLog: pointsLog.data ?? [],
    coupons: coupons.data ?? [],
    isLoading: pointsLog.isLoading,
    redeemPoints,
  };
};
