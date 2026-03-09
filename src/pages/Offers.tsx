import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Clock, Gift, Tag, Percent, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const offers = [
  { title: "Double Points Week", description: "Earn 4 loyalty points per delivery instead of 2!", type: "bonus", icon: Gift, accent: "primary", expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  { title: "15% Off First Delivery", description: "New to DROPEE? Get 15% off your first delivery.", type: "discount", icon: Percent, accent: "secondary", expiry: null },
  { title: "Refer & Earn 10 Points", description: "Refer a friend — you both get 10 bonus loyalty points!", type: "referral", icon: Tag, accent: "primary", expiry: null },
  { title: "Weekend Rush — Free Priority", description: "All weekend deliveries get free priority handling.", type: "bonus", icon: Zap, accent: "secondary", expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
];

const CountdownTimer = ({ expiry }: { expiry: Date }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [expiry]);

  return (
    <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
      <Clock className="w-3 h-3" /> {timeLeft}
    </span>
  );
};

const Offers = () => {
  return (
    <>
      <SEOHead title="Active Offers" description="Exclusive deals for DROPEE customers in Ukhrul — double points, discounts, referral bonuses, and more." path="/offers" />

      {/* Hero */}
      <section className="hero-section py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/4 right-[15%] w-56 h-56 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-primary-foreground text-[10px] sm:text-xs font-semibold mb-4">
              <Sparkles className="w-3 h-3" /> Limited Time
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
              Active <span className="text-gradient-primary">Offers</span>
            </h1>
            <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
              Exclusive deals for DROPEE customers in Ukhrul.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Weekly Highlight */}
      <AnimatedSection className="py-8 sm:py-12 -mt-6 sm:-mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-primary p-6 sm:p-8 md:p-10"
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-40 sm:w-56 h-40 sm:h-56 bg-primary-foreground/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-primary-foreground/20 backdrop-blur-sm px-3 py-1 rounded-full text-primary-foreground text-[10px] sm:text-xs font-bold mb-3">
                🌟 This Week's Special
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Double Points on All Deliveries
              </h2>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mb-4">
                4 points per delivery — reach your free delivery faster!
              </p>
              <CountdownTimer expiry={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} />
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Offers Grid */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 sm:mb-8">All Active Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-5 sm:p-6 group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`icon-box w-11 h-11 sm:w-13 sm:h-13 shrink-0 ${
                    offer.accent === "secondary"
                      ? "!bg-[linear-gradient(145deg,hsl(187_85%_43%/0.1),hsl(187_85%_43%/0.05))] !border-[hsl(187_85%_43%/0.1)]"
                      : ""
                  }`}>
                    <offer.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${offer.accent === "secondary" ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base sm:text-lg mb-1">{offer.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2.5">{offer.description}</p>
                    {offer.expiry && <CountdownTimer expiry={offer.expiry} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-3xl sm:text-4xl mb-3 block">🎁</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Want Exclusive Offers?</h2>
            <p className="text-sm text-muted-foreground mb-5 sm:mb-6 max-w-md mx-auto">Sign up and start earning rewards with every delivery.</p>
            <Link to="/login">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Join DROPEE <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Offers;
