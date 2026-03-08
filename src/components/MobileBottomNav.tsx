import { Link, useLocation } from "react-router-dom";
import { Home, Gift, Star, ShoppingBag, CalendarCheck } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/services", icon: Star, label: "Services" },
  { to: "/shop", icon: ShoppingBag, label: "Shop" },
  { to: "/book", icon: CalendarCheck, label: "Book" },
  { to: "/offers", icon: Gift, label: "Offers" },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[56px] rounded-xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
