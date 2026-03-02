import { Link } from "react-router-dom";
import { Package, MapPin, Phone, Mail } from "lucide-react";
import { useFooterLinks, useSiteSettings } from "@/hooks/useContentData";

const Footer = () => {
  const { data: links = [] } = useFooterLinks();
  const { data: settings = {} } = useSiteSettings();

  const address = settings.contact_address || "Ukhrul, Manipur";
  const phone = settings.contact_phone || "+91 XXXXX XXXXX";
  const email = settings.contact_email || "hello@dropee.in";

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">DROPEE</span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed">
              Ukhrul's trusted delivery service. Fast, reliable, and rewarding.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Quick Links</h4>
            <div className="space-y-2">
              {links.map((link) => (
                <Link key={link.id} to={link.url} className="block text-sm text-background/60 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Contact</h4>
            <div className="space-y-2.5 text-sm text-background/60">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>{email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-background/10 text-center text-xs text-background/40">
          © {new Date().getFullYear()} DROPEE. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
