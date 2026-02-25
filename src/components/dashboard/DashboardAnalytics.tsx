import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const DashboardAnalytics = () => {
  const { user } = useAuth();
  const { deliveryCount, pointsBalance, userTier, tiers } = useDashboardData();

  // Monthly delivery data for charts
  const monthlyData = useQuery({
    queryKey: ["monthly-deliveries", user?.id],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date).toISOString();
        const end = endOfMonth(date).toISOString();

        const { data: deliveries } = await supabase
          .from("deliveries")
          .select("fee, is_free")
          .eq("user_id", user!.id)
          .eq("status", "completed")
          .gte("created_at", start)
          .lte("created_at", end);

        const totalFee = deliveries?.reduce((s, d) => s + (Number(d.fee) || 0), 0) ?? 0;
        const saved = deliveries?.filter((d) => d.is_free).reduce((s, d) => s + (Number(d.fee) || 0), 0) ?? 0;

        months.push({
          month: format(date, "MMM"),
          deliveries: deliveries?.length ?? 0,
          spent: totalFee,
          saved: saved,
        });
      }
      return months;
    },
    enabled: !!user?.id,
  });

  const chartData = monthlyData.data ?? [];
  const count = deliveryCount.data ?? 0;
  const points = pointsBalance.data ?? 0;
  const allTiers = tiers.data ?? [];
  const tierName = userTier.data?.tier_name ?? "Starter";

  // Points ring
  const pointsMax = 20;
  const ringProgress = Math.min(100, (points % pointsMax) / pointsMax * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (ringProgress / 100) * circumference;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-bold font-display text-dashboard-card-foreground">Analytics</h2>

      {/* Deliveries Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-4">Deliveries Over Time</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 40% 10%)",
                  border: "1px solid hsl(222 30% 18%)",
                  borderRadius: 8,
                  color: "hsl(210 40% 98%)",
                }}
              />
              <Bar dataKey="deliveries" fill="hsl(24 95% 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Spending Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-4">Spending vs Saved</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 40% 10%)",
                  border: "1px solid hsl(222 30% 18%)",
                  borderRadius: 8,
                  color: "hsl(210 40% 98%)",
                }}
              />
              <Area type="monotone" dataKey="spent" stroke="hsl(24 95% 53%)" fill="hsl(24 95% 53% / 0.2)" />
              <Area type="monotone" dataKey="saved" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39% / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Points Ring + Tier Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Points Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dashboard-card border border-dashboard-border rounded-xl p-4 flex flex-col items-center"
        >
          <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-4">Points to Free Delivery</h3>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(222 30% 18%)" strokeWidth="6" />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(24 95% 53%)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-display text-dashboard-card-foreground">{points % 20}</span>
              <span className="text-[10px] text-muted-foreground">/ 20 pts</span>
            </div>
          </div>
        </motion.div>

        {/* Tier Progression Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-dashboard-card border border-dashboard-border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold text-dashboard-card-foreground mb-4">Tier Progression</h3>
          <div className="space-y-0">
            {allTiers.map((t, i) => {
              const isCurrentOrPast = count >= t.min_deliveries;
              const isCurrent = t.name === tierName;
              return (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs border-2 ${
                        isCurrent
                          ? "bg-primary border-primary text-primary-foreground"
                          : isCurrentOrPast
                          ? "bg-primary/30 border-primary/50 text-primary"
                          : "bg-dashboard-border border-dashboard-border text-muted-foreground"
                      }`}
                    >
                      {isCurrentOrPast ? "✓" : i + 1}
                    </div>
                    {i < allTiers.length - 1 && (
                      <div className={`w-0.5 h-8 ${isCurrentOrPast ? "bg-primary/40" : "bg-dashboard-border"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-dashboard-card-foreground"}`}>
                      {t.name} {isCurrent && "← You"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.min_deliveries}+ deliveries
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
