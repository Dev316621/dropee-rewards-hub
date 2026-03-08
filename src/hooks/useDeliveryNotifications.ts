import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { notifyDeliveryUpdate } from "@/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  out_for_delivery: "Out for Delivery",
  in_transit: "In Transit",
  completed: "Delivered",
  cancelled: "Cancelled",
};

/**
 * Subscribes to realtime delivery status changes for the current user
 * and fires push notifications + in-app toasts.
 */
export const useDeliveryNotifications = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`delivery-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliveries",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new?.status as string;
          const oldStatus = payload.old?.status as string;
          const deliveryId = payload.new?.id as string;

          if (newStatus && newStatus !== oldStatus) {
            // Push notification
            notifyDeliveryUpdate(newStatus, deliveryId);

            // In-app toast
            const label = statusLabels[newStatus] || newStatus;
            toast.info(`Delivery ${label}`, {
              description: `Your delivery #${deliveryId.slice(0, 8)} is now "${label}"`,
            });

            // Invalidate queries so UI updates
            qc.invalidateQueries({ queryKey: ["deliveries"] });
            qc.invalidateQueries({ queryKey: ["delivery-count"] });
            qc.invalidateQueries({ queryKey: ["points-balance"] });
            qc.invalidateQueries({ queryKey: ["free-credits"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);
};
