import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Package, ArrowLeft, MoreHorizontal, Info, Handshake, Gift, FileText, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Blog" },
  { to: "/tiers", label: "Tiers" },
  { to: "/donate", label: "Donate" },
];

const moreLinks = [
  { to: "/about", label: "About", icon: Info },
  { to: "/partners", label: "Partners", icon: Handshake },
  { to: "/offers", label: "Offers", icon: Gift },
  { to: "/policies", label: "Policies", icon: FileText },
  { to: "/book", label: "Book a Service", icon: Package },
];

const allLinks = [
  ...mainLinks,
  ...moreLinks.map(l => ({ to: l.to, label: l.label })),
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { user } = useAuth();

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2">
            {!isHome && (
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted mr-1 touch-manipulation">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg md:text-xl font-bold tracking-tight">DROPEE</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
                  More <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to} className="flex items-center gap-2 cursor-pointer">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm">Track Deliveries</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="h-8 px-3 text-xs">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" className="h-8 px-3 text-xs">Log In</Button>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted active:bg-muted/80 touch-manipulation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - rendered as sibling portal-like element */}
    </nav>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed inset-0 top-14 bg-background z-[60] overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-6 space-y-1">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors touch-manipulation ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/install"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors touch-manipulation"
            >
              <Download className="w-5 h-5" />
              Install App
            </Link>
            <div className="pt-4 space-y-3">
              {user ? (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block">
                  <Button className="w-full h-12 text-base" size="lg">Dashboard</Button>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                  <Button className="w-full h-12 text-base" size="lg">Track Deliveries</Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
