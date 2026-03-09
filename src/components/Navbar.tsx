import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Package, ArrowLeft, MoreHorizontal, Info, Handshake, Gift, FileText, Heart, Download, Shield, Sparkles } from "lucide-react";
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
  const { user, isAdmin } = useAuth();

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2">
            {!isHome && (
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-muted mr-1 touch-manipulation transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                <Package className="w-4.5 h-4.5 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg md:text-xl font-bold tracking-tight">DROPEE</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {mainLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 flex items-center gap-1">
                  More <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to} className="flex items-center gap-2.5 cursor-pointer">
                      <link.icon className="w-4 h-4 text-muted-foreground" />
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
                <Button size="sm" className="rounded-xl shadow-md shadow-primary/20">
                  <Sparkles className="w-3.5 h-3.5" /> Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl">Log In</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="rounded-xl shadow-md shadow-primary/20">Track Deliveries</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="h-8 px-3 text-xs rounded-xl shadow-sm shadow-primary/20">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" className="h-8 px-3 text-xs rounded-xl shadow-sm shadow-primary/20">Log In</Button>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-muted active:bg-muted/80 touch-manipulation transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed inset-0 top-14 bg-background/95 backdrop-blur-xl z-[60] overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-6 space-y-1">
            {allLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all touch-manipulation ${
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
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
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full h-12 text-base rounded-xl shadow-md shadow-primary/20" size="lg">Dashboard</Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full h-12 text-base gap-2 rounded-xl" size="lg">
                        <Shield className="w-5 h-5" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                  <Button className="w-full h-12 text-base rounded-xl shadow-md shadow-primary/20" size="lg">Track Deliveries</Button>
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
