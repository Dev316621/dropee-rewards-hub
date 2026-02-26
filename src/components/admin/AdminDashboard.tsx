import { useAdminStats } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Truck, DollarSign, Gift, Ticket, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <Card className="bg-dashboard-card border-dashboard-border">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-dashboard-card-foreground font-display">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const TIER_COLORS = ["hsl(30,60%,50%)", "hsl(0,0%,70%)", "hsl(45,93%,47%)", "hsl(260,80%,65%)"];

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold font-display text-dashboard-card-foreground">Admin Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 bg-dashboard-border rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-dashboard-card-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} color="bg-primary" />
        <StatCard icon={Truck} label="Total Deliveries" value={stats?.totalDeliveries ?? 0} color="bg-secondary" />
        <StatCard icon={TrendingUp} label="Completed" value={stats?.completedDeliveries ?? 0} color="bg-emerald-600" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(0)}`} color="bg-amber-600" />
        <StatCard icon={Gift} label="Points Redeemed" value={stats?.totalPointsRedeemed ?? 0} color="bg-purple-600" />
        <StatCard icon={Ticket} label="Coupons" value={stats?.totalCoupons ?? 0} color="bg-pink-600" />
      </div>

      {/* Delivery chart */}
      <Card className="bg-dashboard-card border-dashboard-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-dashboard-card-foreground">Deliveries by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.deliveriesByMonth ?? []}>
                <XAxis dataKey="month" tick={{ fill: "hsl(215,20%,65%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(215,20%,65%)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(222,40%,10%)", border: "1px solid hsl(222,30%,18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(24,95%,53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
