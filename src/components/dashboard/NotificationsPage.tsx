import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const typeIcons: Record<string, string> = {
  delivery_complete: "📦",
  reward_redeemed: "🎁",
  tier_upgrade: "🏆",
  spin_win: "🎡",
  coupon_received: "🎟️",
  region_approved: "📍",
  referral: "🤝",
  info: "ℹ️",
};

const NotificationsPage = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead } = useNotifications();

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-dashboard-card-foreground">
          Notifications
        </h2>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markAllRead.mutate()}
            className="text-muted-foreground gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full bg-dashboard-border rounded-xl" />
        ))
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-dashboard-card border rounded-xl p-3.5 flex items-start gap-3 transition-colors ${
                n.is_read
                  ? "border-dashboard-border"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5">{typeIcons[n.type] ?? "📬"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dashboard-card-foreground">{n.title}</p>
                {n.message && (
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(n.created_at), "MMM d, h:mm a")}
                </p>
              </div>
              {!n.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-8 w-8 p-0"
                  onClick={() => markAsRead.mutate(n.id)}
                >
                  <Check className="h-4 w-4 text-primary" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
