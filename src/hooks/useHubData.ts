import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

// Types
export interface HubWebsite {
  id: string;
  name: string;
  label_color: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
}

export interface HubAgent {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface HubOrder {
  id: string;
  website_id: string;
  external_order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  notes: string;
  status: string;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
  hub_websites?: { name: string; label_color: string };
  hub_delivery_agents?: { name: string; phone: string } | null;
}

export interface HubStatusLog {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

export const HUB_STATUSES = ["pending", "confirmed", "preparing", "picked_up", "on_the_way", "delivered", "cancelled"] as const;

// ---- Websites ----
export const useHubWebsites = () =>
  useQuery({
    queryKey: ["hub-websites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hub_websites").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as HubWebsite[];
    },
  });

export const useCreateHubWebsite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name: string; label_color: string }) => {
      const { data, error } = await supabase.from("hub_websites").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-websites"] }),
  });
};

export const useUpdateHubWebsite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<HubWebsite> & { id: string }) => {
      const { error } = await supabase.from("hub_websites").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-websites"] }),
  });
};

export const useRegenerateApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const newKey = crypto.randomUUID();
      const { error } = await supabase.from("hub_websites").update({ api_key: newKey }).eq("id", id);
      if (error) throw error;
      return newKey;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-websites"] }),
  });
};

export const useDeleteHubWebsite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hub_websites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-websites"] }),
  });
};

// ---- Agents ----
export const useHubAgents = () =>
  useQuery({
    queryKey: ["hub-agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hub_delivery_agents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as HubAgent[];
    },
  });

export const useCreateHubAgent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name: string; phone: string }) => {
      const { error } = await supabase.from("hub_delivery_agents").insert(values);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-agents"] }),
  });
};

export const useUpdateHubAgent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<HubAgent> & { id: string }) => {
      const { error } = await supabase.from("hub_delivery_agents").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-agents"] }),
  });
};

export const useDeleteHubAgent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hub_delivery_agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hub-agents"] }),
  });
};

// ---- Orders ----
export const useHubOrders = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("hub-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hub_orders" }, () => {
        qc.invalidateQueries({ queryKey: ["hub-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: ["hub-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_orders")
        .select("*, hub_websites(name, label_color), hub_delivery_agents(name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HubOrder[];
    },
  });
};

export const useHubOrderStatusLog = (orderId: string | null) =>
  useQuery({
    queryKey: ["hub-order-status-log", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_order_status_log")
        .select("*")
        .eq("order_id", orderId!)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      return data as HubStatusLog[];
    },
  });

export const useUpdateHubOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order_id, new_status, assigned_agent_id }: { order_id: string; new_status?: string; assigned_agent_id?: string | null }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("hub-update-status", {
        body: { order_id, new_status, assigned_agent_id },
      });
      if (res.error) throw new Error(res.error.message || "Failed to update");
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hub-orders"] });
      qc.invalidateQueries({ queryKey: ["hub-order-status-log"] });
    },
  });
};
