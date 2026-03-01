import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CountUp from "@/components/CountUp";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Package, Truck, Users, Star, ArrowRight, Gift, Zap, Clock, Trophy, ChevronRight } from "lucide-react";

const DeliveryAnimation = () => (
  <div className="relative w-full h-32 sm:h-48 md:h-64">
    <div className="absolute bottom-8 left-0 right-0 h-1 bg-primary-foreground/20 rounded-full" />
    <motion.div
      animate={{ x: ["-10%", "110%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-10"
    >
      <div className="relative">
        <Truck className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary" />
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-2 -right-1"
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
        </motion.div>
      </div>
    </motion.div>
    {[10, 30, 55, 75, 90].map((left, i) => (
      <div
        key={i}
        className="absolute bottom-8 bg-primary-foreground/10 rounded-t-md"
        style={{ left: `${left}%`, width: `${20 + i * 5}px`, height: `${30 + i * 12}px` }}
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
        "url": "https://dropee.in",
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
          <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Now delivering in Ukhrul
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6"
            >
              Every Delivery{" "}
              <span className="text-gradient-primary">Earns You</span>{" "}
              Rewards
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-lg md:text-xl text-primary-foreground/70 mb-6 sm:mb-8 max-w-xl"
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
                <Button variant="hero" size="xl" className="w-full sm:w-auto h-12 sm:h-auto text-sm sm:text-base">
                  Track My Deliveries <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto h-12 sm:h-auto text-sm sm:text-base">
                  Our Services
                </Button>
              </Link>
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
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Loyalty Points Explainer */}
      <AnimatedSection className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            How <span className="text-gradient-primary">Rewards</span> Work
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8 sm:mb-12">
            Simple, transparent, and rewarding. Every delivery brings you closer to free ones.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Truck, title: "Complete Deliveries", desc: "Every delivery earns you 2 loyalty points automatically." },
              { icon: Gift, title: "Collect 20 Points", desc: "Reach 20 points to redeem for a completely free delivery!" },
              { icon: Trophy, title: "Level Up Tiers", desc: "The more you deliver, the higher your tier — unlock perks." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-elevated p-5 sm:p-6 text-center"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Tier Leaderboard Preview */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-display text-xl sm:text-3xl font-bold mb-1">Tier Leaderboard</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Top performers this month</p>
            </div>
            <Link to="/tiers" className="text-primary text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
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
                className={`${tier.className} rounded-xl p-4 sm:p-5 text-center text-primary-foreground`}
              >
                <span className="text-2xl sm:text-3xl">{tier.icon}</span>
                <h3 className="font-display font-bold text-sm sm:text-base mt-1.5 sm:mt-2">{tier.name}</h3>
                <p className="text-xs opacity-80">{tier.deliveries} deliveries</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Weekly Offer Banner */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-primary p-6 sm:p-8 md:p-12">
            <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1 bg-primary-foreground/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-primary-foreground text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Limited Time Offer
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-2 sm:mb-3">
                This Week's DROPEE Special
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-primary-foreground/80 mb-4 sm:mb-6">
                Double loyalty points on all deliveries this week! 4 points per delivery — reach your free delivery faster.
              </p>
              <Link to="/offers">
                <Button variant="heroOutline" size="lg" className="h-10 sm:h-auto text-xs sm:text-sm">
                  View All Offers <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-xl sm:text-3xl font-bold text-center mb-6 sm:mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group card-elevated p-4 sm:p-5 cursor-pointer touch-manipulation">
                <summary className="font-semibold text-sm sm:text-base text-foreground flex items-center justify-between list-none gap-2">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Start Earning <span className="text-gradient-primary">Rewards</span> Today
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 sm:mb-8">
            Join hundreds of happy customers in Ukhrul who earn points and free deliveries with every order.
          </p>
          <Link to="/login">
            <Button variant="hero" size="xl" className="w-full sm:w-auto h-12 sm:h-auto text-sm sm:text-base">
              Get Started — It's Free <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Index;
