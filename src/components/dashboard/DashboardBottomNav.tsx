import { Link, useLocation } from "react-router-dom";
import { Home, Truck, Gift, Disc3, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

const baseNavItems = [
  { icon: Home, label: "Overview", path: "/dashboard" },
  { icon: Truck, label: "Deliveries", path: "/dashboard/deliveries" },
  { icon: Gift, label: "Rewards", path: "/dashboard/rewards" },
  { icon: Disc3, label: "Spin", path: "/dashboard/spin" },
  { icon: Bell, label: "Alerts", path: "/dashboard/notifications" },
];

const DashboardBottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dashboard-card border-t border-dashboard-border safe-area-bottom sm:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors touch-manipulation relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[8px] rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardBottomNav;
