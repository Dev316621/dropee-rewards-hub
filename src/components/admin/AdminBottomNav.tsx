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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Gift, Settings, FileText, Handshake, Ticket, Package,
  Disc3, ScrollText, ShoppingBag, CalendarCheck, Globe, UserCheck, BookOpen, Home
} from "lucide-react";

const primaryNavItems = [
  { icon: LayoutDashboard, label: "Home", path: "/admin" },
  { icon: Network, label: "Orders", path: "/admin/hub" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Truck, label: "Deliveries", path: "/admin/deliveries" },
];

const moreGroups = [
  {
    label: "Order Hub",
    items: [
      { icon: Globe, label: "Websites", path: "/admin/hub-websites" },
      { icon: UserCheck, label: "Agents", path: "/admin/hub-agents" },
      { icon: BookOpen, label: "API Docs", path: "/admin/hub-docs" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
      { icon: Package, label: "API Tracking", path: "/admin/api-integrations" },
      { icon: Settings, label: "Pricing", path: "/admin/pricing" },
      { icon: ScrollText, label: "Services", path: "/admin/services" },
      { icon: ShoppingBag, label: "Shop", path: "/admin/shop" },
      { icon: CalendarCheck, label: "Bookings", path: "/admin/bookings" },
    ],
  },
  {
    label: "Engagement",
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
      { icon: Home, label: "Dashboard", path: "/dashboard" },
    ],
  },
];

const allMorePaths = moreGroups.flatMap(g => g.items.map(i => i.path));

const AdminBottomNav = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = allMorePaths.some(
    (path) => location.pathname === path || 
    (path !== "/admin" && location.pathname.startsWith(path))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-14">
        {primaryNavItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || 
            (path !== "/admin" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors touch-manipulation relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
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
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors touch-manipulation relative",
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
          <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-0">
            <SheetHeader className="px-6 pb-2">
              <SheetTitle className="text-left">All Sections</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(75vh-4rem)] px-4">
              <div className="space-y-6 pb-8">
                {moreGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-3">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {group.items.map(({ icon: Icon, label, path }) => {
                        const isActive = location.pathname === path || 
                          (path !== "/admin" && location.pathname.startsWith(path));
                        return (
                          <Link
                            key={path}
                            to={path}
                            onClick={() => setMoreOpen(false)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all touch-manipulation",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-muted-foreground active:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                              isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default AdminBottomNav;
