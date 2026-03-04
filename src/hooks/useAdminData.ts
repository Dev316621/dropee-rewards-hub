import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Stats ──
export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, deliveries, points, coupons] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("deliveries").select("id, status, fee, created_at"),
        supabase.from("loyalty_points_log").select("amount"),
        supabase.from("coupons").select("id", { count: "exact", head: true }),
      ]);
      const allDeliveries = deliveries.data ?? [];
      const completedDeliveries = allDeliveries.filter(d => d.status === "completed");
      const totalRevenue = completedDeliveries.reduce((s, d) => s + (Number(d.fee) || 0), 0);
      const totalPointsRedeemed = (points.data ?? []).filter(p => p.amount < 0).reduce((s, p) => s + Math.abs(p.amount), 0);
      return {
        totalUsers: users.count ?? 0,
        totalDeliveries: allDeliveries.length,
        completedDeliveries: completedDeliveries.length,
        totalRevenue,
        totalPointsRedeemed,
        totalCoupons: coupons.count ?? 0,
        deliveriesByMonth: groupByMonth(allDeliveries),
      };
    },
  });

function groupByMonth(deliveries: { created_at: string }[]) {
  const months: Record<string, number> = {};
  deliveries.forEach(d => {
    const m = d.created_at.slice(0, 7);
    months[m] = (months[m] || 0) + 1;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, count }));
}

// ── Customers ──
export const useAdminCustomers = (search: string) =>
  useQuery({
    queryKey: ["admin-customers", search],
    queryFn: async () => {
      let q = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
      if (search) q = q.ilike("full_name", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

// ── Deliveries ──
export const useAdminDeliveries = (page: number, statusFilter: string) => {
  const pageSize = 20;
  return useQuery({
    queryKey: ["admin-deliveries", page, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("deliveries")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error, count } = await q;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
};

export const useCreateDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (delivery: { user_id: string; pickup: string; dropoff: string; fee: number; weight: number; status: string; is_free: boolean; recipient_name?: string; description?: string; receipt?: string }) => {
      const { error } = await supabase.from("deliveries").insert(delivery);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-deliveries"] }),
  });
};

export const useUpdateDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; fee?: number; is_free?: boolean; recipient_name?: string; description?: string; receipt?: string }) => {
      const { error } = await supabase.from("deliveries").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-deliveries"] }),
  });
};

export const useDeleteDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deliveries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-deliveries"] }),
  });
};

// ── Blog ──
export const useAdminBlogPosts = () =>
  useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useUpsertBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: { id?: string; title: string; slug: string; content?: string; excerpt?: string; category?: string; status?: string; image_url?: string; is_pinned?: boolean }) => {
      const { error } = post.id
        ? await supabase.from("blog_posts").update(post).eq("id", post.id)
        : await supabase.from("blog_posts").insert(post);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] }),
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] }),
  });
};

// ── Partners ──
export const useAdminPartners = () =>
  useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const useUpsertPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partner: { id?: string; name: string; description?: string; link?: string; logo_url?: string; discount_code?: string; is_featured?: boolean; display_order?: number }) => {
      const { error } = partner.id
        ? await supabase.from("partners").update(partner).eq("id", partner.id)
        : await supabase.from("partners").insert(partner);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-partners"] }),
  });
};

export const useDeletePartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-partners"] }),
  });
};

// ── Coupons ──
export const useAdminCoupons = () =>
  useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useUpsertCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: { id?: string; code: string; discount_type: string; discount_value: number; max_uses?: number; expiry_date?: string; is_public?: boolean; is_active?: boolean; assigned_user_id?: string | null }) => {
      const { error } = coupon.id
        ? await supabase.from("coupons").update(coupon).eq("id", coupon.id)
        : await supabase.from("coupons").insert(coupon);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
};

// ── Loyalty Settings ──
export const useAdminLoyaltySettings = () =>
  useQuery({
    queryKey: ["admin-loyalty-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach(s => { map[s.key] = s.value; });
      return map;
    },
  });

export const useUpdateLoyaltySetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("loyalty_settings").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-loyalty-settings"] }),
  });
};

// ── Spin Slots & Config ──
export const useAdminSpinConfig = () =>
  useQuery({
    queryKey: ["admin-spin-config"],
    queryFn: async () => {
      const [config, slots] = await Promise.all([
        supabase.from("spin_config").select("*"),
        supabase.from("spin_slots").select("*").order("display_order"),
      ]);
      return { configs: config.data ?? [], slots: slots.data ?? [] };
    },
  });

export const useUpsertSpinSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slot: { id?: string; label: string; prize_type: string; prize_value?: string; probability_weight: number; color?: string; icon?: string; spin_type: string; is_active?: boolean; display_order?: number; coupon_expiry_days?: number }) => {
      const { error } = slot.id
        ? await supabase.from("spin_slots").update(slot).eq("id", slot.id)
        : await supabase.from("spin_slots").insert(slot);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-spin-config"] }),
  });
};

export const useDeleteSpinSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("spin_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-spin-config"] }),
  });
};

export const useUpdateSpinConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; enabled?: boolean; max_spins?: number }) => {
      const { error } = await supabase.from("spin_config").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-spin-config"] }),
  });
};

// ── Tiers ──
export const useAdminTiers = () =>
  useQuery({
    queryKey: ["admin-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tiers").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });
