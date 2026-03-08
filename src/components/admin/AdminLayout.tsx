import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  BarChart3, Users, Truck, Gift, Settings, FileText, 
  Handshake, Ticket, LogOut, Package, ChevronLeft, ChevronRight,
  LayoutDashboard, Disc3, Home, ScrollText, DollarSign, ShoppingBag, CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navSections = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
      { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Users, label: "Customers", path: "/admin/customers" },
      { icon: Truck, label: "Deliveries", path: "/admin/deliveries" },
      { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
      { icon: Package, label: "API Tracking", path: "/admin/api-integrations" },
      { icon: Settings, label: "Pricing", path: "/admin/pricing" },
      { icon: ScrollText, label: "Services", path: "/admin/services" },
    ],
  },
  {
    label: "Gamification",
    items: [
      { icon: Gift, label: "Loyalty", path: "/admin/loyalty" },
      { icon: Disc3, label: "Spin Wheel", path: "/admin/spin" },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: FileText, label: "Blog", path: "/admin/blog" },
      { icon: Handshake, label: "Partners", path: "/admin/partners" },
      { icon: ScrollText, label: "Site Content", path: "/admin/content" },
    ],
  },
  {
    label: "Quick Links",
    items: [
      { icon: Home, label: "User Dashboard", path: "/dashboard" },
    ],
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-dashboard-border bg-dashboard-card sticky top-0 h-screen transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="p-3 border-b border-dashboard-border flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-sm font-bold font-display text-dashboard-card-foreground">DROPEE</span>
                <span className="text-[10px] text-muted-foreground block -mt-0.5">Admin</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ icon: Icon, label, path }) => {
                  const isActive = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
                  return (
                    <Link
                      key={path}
                      to={path}
                      title={collapsed ? label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-dashboard-border hover:text-dashboard-card-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-dashboard-border">
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground truncate px-2.5 mb-1">{user?.email}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive text-xs h-8"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dashboard-card border-b border-dashboard-border">
        <div className="flex items-center justify-between p-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold font-display text-dashboard-card-foreground">Admin</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        {/* Mobile nav scroll */}
        <div className="flex overflow-x-auto gap-1 px-2 pb-2 scrollbar-hide">
          {navSections.flatMap(s => s.items).map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all",
                  isActive ? "bg-primary text-primary-foreground" : "bg-dashboard-border text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 md:p-6 p-4 pt-28 md:pt-6 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
