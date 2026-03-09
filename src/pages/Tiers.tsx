import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { ChevronRight, Check, Crown, Sparkles, Trophy, Award } from "lucide-react";

const tiers = [
  {
    name: "Starter", icon: "🥉", range: "0–9 deliveries", cssClass: "tier-bronze",
    glowClass: "hover:shadow-[0_0_30px_hsl(30_60%_50%/0.3)]",
    perks: ["Basic loyalty points (2 pts/delivery)", "Weekly Dropee Offer eligibility", "Daily & Weekly spin access"],
  },
  {
    name: "Regular", icon: "🥈", range: "10–24 deliveries", cssClass: "tier-silver",
    glowClass: "hover:shadow-[0_0_30px_hsl(0_0%_70%/0.3)]",
    perks: ["All Starter perks", "5% priority in delivery queue", "1 exclusive coupon per month", "Priority Tag on profile"],
  },
  {
    name: "Elite", icon: "🥇", range: "25–49 deliveries", cssClass: "tier-gold",
    glowClass: "hover:shadow-[0_0_30px_hsl(45_93%_47%/0.3)]",
    perks: ["All Regular perks", "Priority handling on deliveries", "Exclusive promo access", "Birthday free delivery 🎂"],
  },
  {
    name: "DROPEE Prime", icon: "💎", range: "50+ deliveries", cssClass: "tier-diamond",
    glowClass: "hover:shadow-[0_0_30px_hsl(260_80%_65%/0.3)]",
    perks: ["All Elite perks", "Top priority — PRIME tag", "Exclusive partner discounts", "Early access to all offers", "Special animated badge"],
  },
];

const milestones = [0, 10, 25, 50];

const faqItems = [
  { q: "How do I level up my tier?", a: "Automatically based on total completed deliveries." },
  { q: "Can I lose my tier?", a: "No — tiers are lifetime. Once earned, you keep it!" },
  { q: "How often can I spin?", a: "Daily Spin every 24 hours + Weekly Mega Spin once per week." },
  { q: "Can I win points from the spin wheel?", a: "Yes! Points from spins + delivery points both count toward free deliveries." },
];

const Tiers = () => {
  return (
    <>
      <SEOHead title="Loyalty Tiers" description="Unlock exclusive perks with DROPEE tiers — Starter, Regular, Elite, and Prime. The more you deliver, the more you earn." path="/tiers" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqItems.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
      })}} />

      {/* Hero */}
      <section className="hero-section py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/3 left-[15%] w-48 h-48 rounded-full bg-tier-gold/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-56 h-56 rounded-full bg-tier-diamond/10 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-primary-foreground text-[10px] sm:text-xs font-semibold mb-4">
              <Crown className="w-3 h-3" /> Loyalty Program
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
              Loyalty <span className="text-gradient-primary">Tiers</span>
            </h1>
            <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
              The more you deliver, the more you earn. Unlock exclusive perks as you progress.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Path */}
      <AnimatedSection className="py-8 sm:py-14 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-lg sm:text-xl font-bold text-center mb-6 sm:mb-8">Your Path to Prime</h2>
          <div className="relative">
            {/* Track line */}
            <div className="absolute top-5 sm:top-6 left-0 right-0 h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "25%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(30 60% 50%), hsl(45 93% 47%))" }}
              />
            </div>
            <div className="relative flex justify-between">
              {tiers.map((tier, i) => (
                <div key={tier.name} className="flex flex-col items-center z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${tier.cssClass} flex items-center justify-center text-lg sm:text-xl shadow-lg ring-2 ring-background`}
                  >
                    {tier.icon}
                  </motion.div>
                  <span className="text-[10px] sm:text-xs font-bold mt-2 sm:mt-2.5 text-center">{tier.name}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">{milestones[i]}+ deliveries</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Tier Cards */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card-elevated overflow-hidden transition-shadow duration-300 ${tier.glowClass}`}
              >
                <div className={`${tier.cssClass} p-4 sm:p-5 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.span
                      className="text-2xl sm:text-3xl"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                      transition={{ duration: 0.4 }}
                    >
                      {tier.icon}
                    </motion.span>
                    <div className="text-primary-foreground">
                      <h3 className="font-display text-lg sm:text-xl font-bold">{tier.name}</h3>
                      <p className="text-xs sm:text-sm opacity-80">{tier.range}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <ul className="space-y-2 sm:space-y-2.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection className="py-10 sm:py-14 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {[
              { icon: Trophy, label: "Tiers", value: "4", color: "text-primary" },
              { icon: Sparkles, label: "Perks", value: "15+", color: "text-secondary" },
              { icon: Award, label: "Lifetime", value: "∞", color: "text-primary" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-4 sm:p-5 text-center"
              >
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="font-display text-xl sm:text-2xl font-bold">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-8">Tier FAQ</h2>
          <div className="space-y-3 sm:space-y-4">
            {faqItems.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group card-elevated p-4 sm:p-5 cursor-pointer touch-manipulation"
              >
                <summary className="font-semibold text-sm flex items-center justify-between list-none gap-2">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Tiers;
