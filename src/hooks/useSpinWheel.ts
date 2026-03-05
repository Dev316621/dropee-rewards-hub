import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSpinWheel = (spinType: "daily" | "weekly" = "daily") => {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();

  // Fetch active slots for this spin type
  const slots = useQuery({
    queryKey: ["spin-slots", spinType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_slots")
        .select("*")
        .eq("spin_type", spinType)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch config for this spin type
  const config = useQuery({
    queryKey: ["spin-config", spinType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_config")
        .select("*")
        .eq("spin_type", spinType)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Count today's/this week's spins
  const spinsUsed = useQuery({
    queryKey: ["spins-used", spinType, userId],
    queryFn: async () => {
      const now = new Date();
      let startDate: string;
      if (spinType === "daily") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
      }
      const { count, error } = await supabase
        .from("spin_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("spin_type", spinType)
        .gte("created_at", startDate);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });

  // Spin history
  const history = useQuery({
    queryKey: ["spin-history", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_results")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  // Determine winner server-side (weighted random from slots)
  const spin = useMutation({
    mutationFn: async () => {
      const activeSlots = slots.data ?? [];
      if (activeSlots.length === 0) throw new Error("No slots configured");

      // Check for preset win first
      let winner = activeSlots[0];
      let presetUsed = false;
      
      const { data: preset } = await supabase
        .from("spin_preset_wins")
        .select("*, spin_slots(*)")
        .eq("user_id", userId!)
        .eq("spin_type", spinType)
        .eq("used", false)
        .order("created_at")
        .limit(1)
        .maybeSingle();
      
      if (preset && preset.spin_slots) {
        winner = preset.spin_slots as any;
        presetUsed = true;
        // Mark preset as used
        await supabase.from("spin_preset_wins").update({ used: true }).eq("id", preset.id);
      } else {
        // Weighted random selection
        const totalWeight = activeSlots.reduce((s, sl) => s + sl.probability_weight, 0);
        let rand = Math.random() * totalWeight;
        for (const slot of activeSlots) {
          rand -= slot.probability_weight;
          if (rand <= 0) { winner = slot; break; }
        }
      }

      // Record result
      const { data, error } = await supabase
        .from("spin_results")
        .insert({
          user_id: userId!,
          spin_type: spinType,
          slot_id: winner.id,
          prize_type: winner.prize_type,
          prize_value: winner.prize_value ?? "",
        })
        .select()
        .single();
      if (error) throw error;

      // Deliver prize
      if (winner.prize_type === "points" && winner.prize_value) {
        const pts = parseInt(winner.prize_value, 10);
        if (pts > 0) {
          await supabase.from("loyalty_points_log").insert({
            user_id: userId!,
            amount: pts,
            source: "spin",
            spin_id: data.id,
            note: `Won ${pts} points from ${spinType} spin`,
          });
        }
      } else if (winner.prize_type === "free_delivery") {
        // Add 1 free delivery credit
        const { data: existing } = await supabase
          .from("free_delivery_credits")
          .select("*")
          .eq("user_id", userId!)
          .single();
        if (existing) {
          await supabase.from("free_delivery_credits")
            .update({ total_credits: existing.total_credits + 1 })
            .eq("id", existing.id);
        } else {
          await supabase.from("free_delivery_credits").insert({
            user_id: userId!,
            total_credits: 1,
            used_credits: 0,
          });
        }
      }

      // Send notification
      if (winner.prize_type !== "no_prize") {
        await supabase.from("notifications").insert({
          user_id: userId!,
          title: "🎉 Spin Winner!",
          message: `You won: ${winner.label}`,
          type: "reward",
        });
      }

      return { result: data, slot: winner };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spins-used"] });
      qc.invalidateQueries({ queryKey: ["spin-history"] });
      qc.invalidateQueries({ queryKey: ["points-balance"] });
      qc.invalidateQueries({ queryKey: ["free-credits"] });
    },
  });

  const maxSpins = config.data?.max_spins ?? 1;
  const used = spinsUsed.data ?? 0;
  const canSpin = (config.data?.enabled ?? true) && used < maxSpins && (slots.data?.length ?? 0) > 0;
  const remaining = Math.max(0, maxSpins - used);

  return { slots, config, spinsUsed, history, spin, canSpin, remaining, maxSpins };
};
