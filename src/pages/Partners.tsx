import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";

const partners = [
  { name: "Ukhrul Fresh Market", description: "Fresh produce and groceries from the heart of Ukhrul.", discount: "10% off with DROPEE10", featured: true },
  { name: "Mountain Café", description: "Authentic Tangkhul cuisine and mountain coffee.", discount: "Free delivery on ₹300+", featured: false },
  { name: "Ukhrul Pharmacy", description: "Medicines and health essentials delivered safely.", discount: "5% off first order", featured: false },
  { name: "Hill Electronics", description: "Electronics and gadgets — quick delivery.", discount: "₹20 off delivery", featured: false },
  { name: "Tangkhul Bakery", description: "Freshly baked bread, cakes, and pastries.", discount: "Free cookie with delivery", featured: false },
  { name: "Green Valley Nursery", description: "Plants, seeds, and gardening supplies.", discount: "15% off with DROPEE", featured: false },
];

const Partners = () => {
  return (
    <>
      <section className="hero-section py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
            Our <span className="text-gradient-primary">Partners</span>
          </h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
            Local businesses in Ukhrul that trust DROPEE.
          </p>
        </div>
      </section>

      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`card-elevated p-4 sm:p-6 relative ${partner.featured ? "ring-2 ring-primary" : ""}`}
              >
                {partner.featured && (
                  <div className="absolute -top-2.5 left-3 sm:left-4 inline-flex items-center gap-1 bg-primary text-primary-foreground px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Partner of the Week
                  </div>
                )}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-bold text-primary">{partner.name.charAt(0)}</span>
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg mb-1.5 sm:mb-2">{partner.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{partner.description}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium bg-accent text-accent-foreground px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
