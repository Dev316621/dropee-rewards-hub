import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Truck, ShoppingBag, Zap, Handshake, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = { Package, Truck, ShoppingBag, Zap, Handshake };

const fallbackServices = [
  { icon: Package, title: "Pick & Drop", description: "From documents to parcels, DROPEE picks up from any location in Ukhrul and drops it where you need." },
  { icon: Truck, title: "Custom Delivery", description: "Fragile items, timed deliveries, or special handling — we customize the delivery experience." },
  { icon: ShoppingBag, title: "Food & Grocery", description: "Fresh food and daily essentials from restaurants and local stores, right to your doorstep." },
  { icon: Zap, title: "Instant Delivery", description: "Urgent delivery? Your package moves within minutes with priority handling." },
  { icon: Handshake, title: "Business Partnership", description: "Bulk rates, dedicated support, and featured placement on our platform for your business." },
];

const Services = () => {
  const { data: dbServices } = useQuery({
    queryKey: ["public-service-types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_types").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const services = (dbServices && dbServices.length > 0)
    ? dbServices.map(s => ({ icon: iconMap[s.icon || "Package"] || Package, title: s.name, description: s.description || "" }))
    : fallbackServices;

  return (
    <>
      <SEOHead title="Services" description="DROPEE delivery services in Ukhrul — Pick & Drop, Custom Delivery, Food & Grocery, Instant Delivery, and Business Partnerships." path="/services" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": services.map((s, i) => ({
          "@type": "Service", "position": i + 1, "name": s.title, "description": s.description,
          "provider": { "@type": "LocalBusiness", "name": "DROPEE", "address": { "@type": "PostalAddress", "addressLocality": "Ukhrul", "addressRegion": "Manipur" } },
        })),
      })}} />

      <section className="hero-section py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
            Our <span className="text-gradient-primary">Services</span>
          </h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
            Everything you need, delivered. From instant parcels to business partnerships.
          </p>
        </div>
      </section>

      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-5 sm:p-6 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2 sm:mb-3">{service.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5">{service.description}</p>
                <Link to="/book" className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:gap-2 transition-all">
                  Book Now <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Start?</h2>
          <p className="text-sm text-muted-foreground mb-5 sm:mb-6 max-w-md mx-auto">
            Join DROPEE today and earn rewards with every delivery.
          </p>
          <Link to="/book">
            <Button variant="hero" size="lg" className="w-full sm:w-auto h-12 sm:h-auto text-sm sm:text-base">
              Book a Service <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Services;
