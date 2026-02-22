import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Truck, ShoppingBag, Zap, Handshake, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Package,
    title: "Pick & Drop",
    description: "Need something picked up and delivered? We'll handle it. From documents to parcels, DROPEE picks up from any location in Ukhrul and drops it where you need.",
  },
  {
    icon: Truck,
    title: "Custom Delivery",
    description: "Have specific delivery requirements? Fragile items, timed deliveries, or special handling — we customize the delivery experience to match your needs.",
  },
  {
    icon: ShoppingBag,
    title: "Food & Grocery",
    description: "Order from your favorite restaurants and local grocery stores. We bring fresh food and daily essentials right to your doorstep in Ukhrul.",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Urgent delivery? Our instant delivery service gets your package moving within minutes. Priority handling for time-sensitive items.",
  },
  {
    icon: Handshake,
    title: "Business Partnership",
    description: "Partner with DROPEE to offer delivery services for your business. Bulk rates, dedicated support, and featured placement on our platform.",
  },
];

const Services = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": services.map((s, i) => ({
          "@type": "Service",
          "position": i + 1,
          "name": s.title,
          "description": s.description,
          "provider": { "@type": "LocalBusiness", "name": "DROPEE", "address": { "@type": "PostalAddress", "addressLocality": "Ukhrul", "addressRegion": "Manipur" } },
        })),
      })}} />

      <section className="hero-section py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Our <span className="text-gradient-primary">Services</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-xl">
            Everything you need, delivered. From instant parcels to business partnerships — DROPEE has you covered in Ukhrul.
          </p>
        </div>
      </section>

      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px -15px hsl(24 95% 53% / 0.15)" }}
                className="card-elevated p-6 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{service.description}</p>
                <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Delivering?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join DROPEE today and earn rewards with every delivery in Ukhrul.
          </p>
          <Link to="/login">
            <Button variant="hero" size="lg">
              Sign Up Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Services;
