import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const useDeliveries = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 10;

  const deliveries = useQuery({
    queryKey: ["deliveries", user?.id, page, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("deliveries")
        .select("*", { count: "exact" })
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
    enabled: !!user?.id,
  });

  return {
    deliveries: deliveries.data?.data ?? [],
    totalCount: deliveries.data?.count ?? 0,
    isLoading: deliveries.isLoading,
    page,
    setPage,
    pageSize,
    statusFilter,
    setStatusFilter,
  };
};
