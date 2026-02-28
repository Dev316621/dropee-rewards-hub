import { Link, useLocation } from "react-router-dom";
import { Home, Truck, Gift, BarChart3, Bell, LogOut, Package, Disc3, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Overview", path: "/dashboard" },
  { icon: Truck, label: "Deliveries", path: "/dashboard/deliveries" },
  { icon: Gift, label: "Rewards", path: "/dashboard/rewards" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Disc3, label: "Spin & Win", path: "/dashboard/spin" },
  { icon: Trophy, label: "Badges", path: "/dashboard/badges" },
  { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden sm:flex flex-col w-60 bg-dashboard-card border-r border-dashboard-border min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-dashboard-border">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display text-dashboard-card-foreground">DROPEE</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-dashboard-border hover:text-dashboard-card-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-4.5 w-4.5" />
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-destructive text-destructive-foreground text-[8px] rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-dashboard-border">
        <p className="text-xs text-muted-foreground truncate px-3 mb-2">{user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
