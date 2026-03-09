import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CountUp from "@/components/CountUp";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { AvailableAgents } from "@/components/AvailableAgents";
import { motion } from "framer-motion";
import { Package, Truck, Users, Star, ArrowRight, Gift, Zap, Clock, Trophy, ChevronRight, Sparkles, Shield, MapPin, Bike } from "lucide-react";

const DeliveryAnimation = () => (
  <div className="relative w-full h-32 sm:h-48 md:h-64">
    {/* Road */}
    <div className="absolute bottom-8 left-0 right-0 h-1.5 bg-primary-foreground/10 rounded-full overflow-hidden">
      <motion.div
        animate={{ x: ["-100%", "0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(90deg, transparent, transparent 20px, hsl(24 95% 53% / 0.2) 20px, hsl(24 95% 53% / 0.2) 30px)",
        }}
      />
    </div>
    <motion.div
      animate={{ x: ["-10%", "110%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-10"
    >
      <div className="relative">
        <div className="bg-primary/10 rounded-xl p-2 backdrop-blur-sm border border-primary/20">
          <Truck className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-primary" />
        </div>
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-3 -right-2"
        >
          <div className="bg-secondary/20 rounded-lg p-1 backdrop-blur-sm border border-secondary/20">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
          </div>
        </motion.div>
      </div>
    </motion.div>
    {/* City silhouette */}
    {[10, 28, 50, 70, 88].map((left, i) => (
      <div
        key={i}
        className="absolute bottom-8 rounded-t-lg"
        style={{
          left: `${left}%`,
          width: `${18 + i * 4}px`,
          height: `${25 + i * 10}px`,
          background: `linear-gradient(180deg, hsl(24 95% 53% / ${0.04 + i * 0.01}), hsl(220 20% 96% / 0.03))`,
          border: '1px solid hsl(0 0% 100% / 0.03)',
        }}
      />
    ))}
  </div>
);

const stats = [
  { icon: Truck, label: "Deliveries", value: 2480, suffix: "+" },
  { icon: Users, label: "Customers", value: 850, suffix: "+" },
  { icon: Star, label: "5-Star Reviews", value: 420, suffix: "+" },
  { icon: Package, label: "Partners", value: 35, suffix: "+" },
];

const faqs = [
  { q: "How many deliveries do I need for a free delivery in Ukhrul?", a: "Every 20 loyalty points (earned at 2 points per delivery) gets you 1 free delivery with DROPEE." },
  { q: "What is DROPEE Prime?", a: "DROPEE Prime is our highest loyalty tier, unlocked at 50+ deliveries. Members get top priority, partner discounts, early offer access, and a special profile badge." },
  { q: "What areas does DROPEE cover?", a: "DROPEE operates doorstep delivery within Ukhrul, Manipur. Check our About page for exact coverage boundaries and delivery time slots." },
  { q: "How does the DROPEE spin wheel work?", a: "DROPEE customers get a free Daily Spin and Weekly Mega Spin. Each spin can win prizes like discount coupons, free deliveries, or bonus loyalty points." },
  { q: "How many loyalty points do I need for a free delivery?", a: "Every 20 loyalty points can be exchanged for 1 free delivery with DROPEE in Ukhrul. You earn 2 points per delivery and can also win points via the spin wheel." },
];

const tiers = [
  { name: "Starter", icon: "🥉", deliveries: "0–9", className: "tier-bronze" },
  { name: "Regular", icon: "🥈", deliveries: "10–24", className: "tier-silver" },
  { name: "Elite", icon: "🥇", deliveries: "25–49", className: "tier-gold" },
  { name: "Prime", icon: "💎", deliveries: "50+", className: "tier-diamond" },
];

const Index = () => {
  return (
    <>
      <SEOHead title="DROPEE — Delivery Loyalty & Rewards in Ukhrul, Manipur" description="Ukhrul's smartest delivery service. Earn loyalty points, unlock tiers, spin the wheel, and get free deliveries with every order." path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "DROPEE",
        "description": "Fast, reliable delivery service in Ukhrul, Manipur with a gamified loyalty program.",
        "address": { "@type": "PostalAddress", "addressLocality": "Ukhrul", "addressRegion": "Manipur", "addressCountry": "IN" },
        "url": "https://dropee.discoverukhrul.site",
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      })}} />

      {/* Hero */}
      <section className="hero-section relative overflow-hidden min-h-[80vh] sm:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 right-10 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-primary blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-secondary blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-primary text-xs sm:text-sm font-medium mb-5 sm:mb-6 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Now delivering in Ukhrul
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.1] mb-5 sm:mb-6"
            >
              Every Delivery{" "}
              <span className="text-gradient-primary">Earns You</span>{" "}
              Rewards
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-lg md:text-xl text-primary-foreground/60 mb-7 sm:mb-9 max-w-xl leading-relaxed"
            >
              Ukhrul's smartest delivery service. Earn loyalty points, unlock tiers, spin the wheel, and get free deliveries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="w-full sm:w-auto h-12 sm:h-14 text-sm sm:text-base rounded-2xl">
                  Track My Deliveries <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto h-12 sm:h-14 text-sm sm:text-base rounded-2xl">
                  Our Services
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-6 text-xs text-primary-foreground/40"
            >
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary/60" /> Secure & Tracked</span>
              <span className="w-1 h-1 rounded-full bg-primary-foreground/20" />
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" /> 15 min fastest</span>
              <span className="w-1 h-1 rounded-full bg-primary-foreground/20" />
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary/60" /> Ukhrul</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-8 sm:mt-12"
          >
            <DeliveryAnimation />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <AnimatedSection className="py-12 sm:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 sm:p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50"
              >
                <div className="icon-box w-11 h-11 sm:w-13 sm:h-13 mx-auto mb-3">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Loyalty Points Explainer */}
      <AnimatedSection className="py-14 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 border border-primary/10">
              <Gift className="w-3.5 h-3.5" /> Rewards System
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              How <span className="text-gradient-primary">Rewards</span> Work
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-10 sm:mb-14">
              Simple, transparent, and rewarding. Every delivery brings you closer to free ones.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Truck, title: "Complete Deliveries", desc: "Every delivery earns you 2 loyalty points automatically.", color: "primary" },
              { icon: Gift, title: "Collect 20 Points", desc: "Reach 20 points to redeem for a completely free delivery!", color: "secondary" },
              { icon: Trophy, title: "Level Up Tiers", desc: "The more you deliver, the higher your tier — unlock perks.", color: "primary" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="card-elevated p-6 sm:p-8 text-center group"
              >
                <div className="icon-box w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5">
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Tier Leaderboard Preview */}
      <AnimatedSection className="py-12 sm:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3 border border-primary/10">
                <Trophy className="w-3.5 h-3.5" /> Tier System
              </span>
              <h2 className="font-display text-xl sm:text-3xl font-bold">Tier Leaderboard</h2>
            </div>
            <Link to="/tiers" className="text-primary text-xs sm:text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10">
              View all <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${tier.className} rounded-2xl p-5 sm:p-6 text-center text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <span className="text-3xl sm:text-4xl">{tier.icon}</span>
                <h3 className="font-display font-bold text-sm sm:text-lg mt-2 sm:mt-3">{tier.name}</h3>
                <p className="text-xs opacity-70 mt-1">{tier.deliveries} deliveries</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Weekly Offer Banner */}
      <AnimatedSection className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-primary p-7 sm:p-10 md:p-14 shadow-xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 bg-primary-foreground/15 px-3 py-1 rounded-full text-primary-foreground text-xs font-semibold mb-4 border border-primary-foreground/10">
                <Sparkles className="w-3 h-3" /> Limited Time Offer
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-3 sm:mb-4">
                This Week's DROPEE Special
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-primary-foreground/70 mb-5 sm:mb-7 leading-relaxed">
                Double loyalty points on all deliveries this week! 4 points per delivery — reach your free delivery faster.
              </p>
              <Link to="/offers">
                <Button variant="heroOutline" size="lg" className="h-10 sm:h-12 text-xs sm:text-sm rounded-xl">
                  View All Offers <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="py-12 sm:py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3 border border-primary/10">
              FAQ
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group card-elevated p-4 sm:p-5 cursor-pointer touch-manipulation"
              >
                <summary className="font-semibold text-sm sm:text-base text-foreground flex items-center justify-between list-none gap-3">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-0">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-14 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Start Earning <span className="text-gradient-primary">Rewards</span> Today
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-7 sm:mb-9">
              Join hundreds of happy customers in Ukhrul who earn points and free deliveries with every order.
            </p>
            <Link to="/login">
              <Button variant="hero" size="xl" className="w-full sm:w-auto h-12 sm:h-14 text-sm sm:text-base rounded-2xl">
                Get Started — It's Free <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Index;
