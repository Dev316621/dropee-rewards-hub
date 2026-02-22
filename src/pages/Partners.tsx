import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";

const partners = [
  {
    name: "Ukhrul Fresh Market",
    description: "Fresh produce and daily groceries delivered from the heart of Ukhrul's market.",
    discount: "10% off with code DROPEE10",
    featured: true,
  },
  {
    name: "Mountain Café",
    description: "Authentic Tangkhul cuisine and freshly brewed mountain coffee, delivered hot.",
    discount: "Free delivery on orders above ₹300",
    featured: false,
  },
  {
    name: "Ukhrul Pharmacy",
    description: "Medicines and health essentials delivered safely to your door.",
    discount: "5% off first order",
    featured: false,
  },
  {
    name: "Hill Electronics",
    description: "Electronics, accessories, and gadgets — quick delivery within Ukhrul town.",
    discount: "₹20 off delivery",
    featured: false,
  },
  {
    name: "Tangkhul Bakery",
    description: "Freshly baked bread, cakes, and pastries. Perfect for celebrations!",
    discount: "Free cookie with every DROPEE delivery",
    featured: false,
  },
  {
    name: "Green Valley Nursery",
    description: "Plants, seeds, and gardening supplies delivered with care.",
    discount: "15% off with DROPEE",
    featured: false,
  },
];

const Partners = () => {
  return (
    <>
      <section className="hero-section py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Our <span className="text-gradient-primary">Partners</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-xl">
            Local businesses in Ukhrul that trust DROPEE for their delivery needs.
          </p>
        </div>
      </section>

      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`card-elevated p-6 relative ${partner.featured ? "ring-2 ring-primary" : ""}`}
              >
                {partner.featured && (
                  <div className="absolute -top-3 left-4 inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3" /> Partner of the Week
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">{partner.name.charAt(0)}</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{partner.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{partner.description}</p>
                <div className="flex items-center gap-2 text-xs font-medium bg-accent text-accent-foreground px-3 py-1.5 rounded-lg">
                  <ExternalLink className="w-3 h-3" />
                  {partner.discount}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Partners;
