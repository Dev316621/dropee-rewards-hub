import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";

const tiers = [
  { name: "Starter", icon: "🥉", range: "0–9 deliveries", cssClass: "tier-bronze", perks: ["Basic loyalty points (2 pts/delivery)", "Weekly Dropee Offer eligibility", "Daily & Weekly spin access"] },
  { name: "Regular", icon: "🥈", range: "10–24 deliveries", cssClass: "tier-silver", perks: ["All Starter perks", "5% priority in delivery queue", "1 exclusive coupon per month", "Priority Tag on profile"] },
  { name: "Elite", icon: "🥇", range: "25–49 deliveries", cssClass: "tier-gold", perks: ["All Regular perks", "Priority handling on deliveries", "Exclusive promo access", "Birthday free delivery 🎂"] },
  { name: "DROPEE Prime", icon: "💎", range: "50+ deliveries", cssClass: "tier-diamond", perks: ["All Elite perks", "Top priority — PRIME tag", "Exclusive partner discounts", "Early access to all offers", "Special animated badge"] },
];

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

      <section className="hero-section py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
            Loyalty <span className="text-gradient-primary">Tiers</span>
          </h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
            The more you deliver, the more you earn. Unlock exclusive perks as you progress.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <AnimatedSection className="py-8 sm:py-12 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-lg sm:text-xl font-bold text-center mb-5 sm:mb-6">Your Path to Prime</h2>
          <div className="relative">
            <div className="absolute top-4 sm:top-5 left-0 right-0 h-1 bg-border rounded-full" />
            <div className="relative flex justify-between">
              {tiers.map((tier, i) => (
                <div key={tier.name} className="flex flex-col items-center z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, type: "spring" }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${tier.cssClass} flex items-center justify-center text-sm sm:text-lg`}
                  >
                    {tier.icon}
                  </motion.div>
                  <span className="text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 text-center">{tier.name}</span>
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated overflow-hidden"
              >
                <div className={`${tier.cssClass} p-4 sm:p-5 text-primary-foreground`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">{tier.icon}</span>
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold">{tier.name}</h3>
                      <p className="text-xs sm:text-sm opacity-80">{tier.range}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <ul className="space-y-2 sm:space-y-2.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
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

      {/* FAQ */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-8">Tier FAQ</h2>
          <div className="space-y-3 sm:space-y-4">
            {faqItems.map((faq, i) => (
              <details key={i} className="group card-elevated p-4 sm:p-5 cursor-pointer touch-manipulation">
                <summary className="font-semibold text-sm flex items-center justify-between list-none gap-2">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Tiers;
