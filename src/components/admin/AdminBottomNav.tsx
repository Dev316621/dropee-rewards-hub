import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Network, Users, Truck, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Gift, Settings, FileText, Handshake, Ticket, Package,
  Disc3, ScrollText, ShoppingBag, CalendarCheck, Globe, UserCheck, BookOpen, Home
} from "lucide-react";

const primaryNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Network, label: "Orders", path: "/admin/hub" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Truck, label: "Deliveries", path: "/admin/deliveries" },
];

const moreNavItems = [
  { icon: Globe, label: "Websites", path: "/admin/hub-websites" },
  { icon: UserCheck, label: "Agents", path: "/admin/hub-agents" },
  { icon: BookOpen, label: "API Docs", path: "/admin/hub-docs" },
  { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
  { icon: Package, label: "API Tracking", path: "/admin/api-integrations" },
  { icon: Settings, label: "Pricing", path: "/admin/pricing" },
  { icon: ScrollText, label: "Services", path: "/admin/services" },
  { icon: ShoppingBag, label: "Shop", path: "/admin/shop" },
  { icon: CalendarCheck, label: "Bookings", path: "/admin/bookings" },
  { icon: Gift, label: "Loyalty", path: "/admin/loyalty" },
  { icon: Disc3, label: "Spin Wheel", path: "/admin/spin" },
  { icon: FileText, label: "Blog", path: "/admin/blog" },
  { icon: Handshake, label: "Partners", path: "/admin/partners" },
  { icon: ScrollText, label: "Site Content", path: "/admin/content" },
  { icon: Home, label: "User Dashboard", path: "/dashboard" },
];

const AdminBottomNav = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreNavItems.some(
    (item) => location.pathname === item.path || 
    (item.path !== "/admin" && location.pathname.startsWith(item.path))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {primaryNavItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || 
            (path !== "/admin" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors touch-manipulation relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors touch-manipulation relative",
                isMoreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
              {isMoreActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-4 py-6">
              {moreNavItems.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path || 
                  (path !== "/admin" && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default AdminBottomNav;
