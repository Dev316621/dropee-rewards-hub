import { Link } from "react-router-dom";
import { Package, MapPin, Phone, Mail, Instagram, ArrowUpRight } from "lucide-react";
import { useFooterLinks, useSiteSettings } from "@/hooks/useContentData";

const Footer = () => {
  const { data: links = [] } = useFooterLinks();
  const { data: settings = {} } = useSiteSettings();

  const address = settings.contact_address || "Ukhrul, Manipur";
  const phone = settings.contact_phone || "+91 XXXXX XXXXX";
  const email = settings.contact_email || "hello@dropee.discoverukhrul.site";

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">DROPEE</span>
            </Link>
            <p className="text-background/50 text-sm leading-relaxed max-w-xs">
              Ukhrul's trusted delivery service. Fast, reliable, and rewarding — with every order you make.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-background/80">Quick Links</h4>
            <div className="space-y-2.5">
              {links.map((link) => (
                <Link key={link.id} to={link.url} className="group flex items-center gap-1 text-sm text-background/50 hover:text-primary transition-colors">
                  {link.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-background/80">Contact</h4>
            <div className="space-y-3 text-sm text-background/50">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-background/5 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-background/5 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-background/5 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="break-all">{email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/30">
          <p>© {new Date().getFullYear()} DROPEE. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Developed by
            <a href="https://instagram.com/itsnextgenfounder" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              <Instagram className="w-3 h-3" />
              @itsnextgenfounder
            </a>
            — eX Holdings. Jihal Shimray
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
