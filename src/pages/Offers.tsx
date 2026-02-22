import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { Clock, Gift, Tag, Percent, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const offers = [
  {
    title: "Double Points Week",
    description: "Earn 4 loyalty points per delivery instead of 2. Reach your free delivery faster!",
    type: "bonus",
    icon: Gift,
    expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  {
    title: "15% Off First Delivery",
    description: "New to DROPEE? Get 15% off your very first delivery in Ukhrul.",
    type: "discount",
    icon: Percent,
    expiry: null,
  },
  {
    title: "Refer & Earn 10 Points",
    description: "Refer a friend to DROPEE. You both get 10 bonus loyalty points!",
    type: "referral",
    icon: Tag,
    expiry: null,
  },
  {
    title: "Weekend Rush — Free Priority",
    description: "All weekend deliveries get free priority handling. No extra charge!",
    type: "bonus",
    icon: Clock,
    expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
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
    <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs font-medium">
      <Clock className="w-3 h-3" /> {timeLeft}
    </span>
  );
};

const Offers = () => {
  return (
    <>
      <section className="hero-section py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Active <span className="text-gradient-primary">Offers</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-xl">
            Exclusive deals and promotions for DROPEE customers in Ukhrul. Don't miss out!
          </p>
        </div>
      </section>

      {/* Weekly Highlight */}
      <AnimatedSection className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 bg-primary-foreground/20 px-3 py-1 rounded-full text-primary-foreground text-xs font-semibold mb-3">
                🌟 This Week's Special
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Double Points on All Deliveries
              </h2>
              <p className="text-primary-foreground/80 mb-4">
                Every delivery this week earns 4 points instead of 2. Stack with spin wheel wins to reach free deliveries faster!
              </p>
              <CountdownTimer expiry={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* All Offers */}
      <AnimatedSection className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-8">All Active Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-6 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <offer.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                    {offer.expiry && <CountdownTimer expiry={offer.expiry} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-3">Want Exclusive Offers?</h2>
          <p className="text-muted-foreground mb-6">Sign up and start earning rewards today.</p>
          <Link to="/login">
            <Button variant="hero" size="lg">
              Join DROPEE <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Offers;
