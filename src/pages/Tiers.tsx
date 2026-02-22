import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    icon: "🥉",
    range: "0–9 deliveries",
    cssClass: "tier-bronze",
    perks: [
      "Basic loyalty point accumulation (2 pts/delivery)",
      "Weekly Dropee Offer eligibility",
      "Daily & Weekly spin access",
    ],
  },
  {
    name: "Regular",
    icon: "🥈",
    range: "10–24 deliveries",
    cssClass: "tier-silver",
    perks: [
      "All Starter perks",
      "5% priority in delivery queue",
      "1 exclusive coupon per month",
      "Priority Tag on profile",
    ],
  },
  {
    name: "Elite",
    icon: "🥇",
    range: "25–49 deliveries",
    cssClass: "tier-gold",
    perks: [
      "All Regular perks",
      "Priority handling on all deliveries",
      "Exclusive promo access (early unlock)",
      "Birthday free delivery 🎂",
    ],
  },
  {
    name: "DROPEE Prime",
    icon: "💎",
    range: "50+ deliveries",
    cssClass: "tier-diamond",
    perks: [
      "All Elite perks",
      "Top priority — PRIME tag",
      "Exclusive partner discounts",
      "Early access to all offers",
      "Special animated badge & profile frame",
    ],
  },
];

const faqItems = [
  { q: "How do I level up my tier?", a: "Your tier is automatically upgraded based on your total completed deliveries. The more you deliver with DROPEE, the higher your tier!" },
  { q: "Can I lose my tier?", a: "Tiers are based on total lifetime deliveries, so once you reach a tier, you keep it!" },
  { q: "How often can I spin the DROPEE wheel?", a: "You get one Daily Spin every 24 hours and one Weekly Mega Spin every week. Weekly spins have bigger prizes." },
  { q: "Can I win loyalty points from the spin wheel?", a: "Yes! Spin prizes can include loyalty points. Combined with the 2 points you earn per delivery, you can reach 20 points faster to redeem a free delivery." },
];

const Tiers = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      })}} />

      <section className="hero-section py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Loyalty <span className="text-gradient-primary">Tiers</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-xl">
            The more you deliver, the more you earn. Unlock exclusive perks as you progress through our tier system.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <AnimatedSection className="py-12 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-center mb-6">Your Path to Prime</h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-border rounded-full" />
            <div className="relative flex justify-between">
              {tiers.map((tier, i) => (
                <div key={tier.name} className="flex flex-col items-center z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, type: "spring" }}
                    className={`w-10 h-10 rounded-full ${tier.cssClass} flex items-center justify-center text-lg`}
                  >
                    {tier.icon}
                  </motion.div>
                  <span className="text-xs font-medium mt-2 text-center">{tier.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Tier Cards */}
      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="card-elevated overflow-hidden"
              >
                <div className={`${tier.cssClass} p-5 text-primary-foreground`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tier.icon}</span>
                    <div>
                      <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                      <p className="text-sm opacity-80">{tier.range}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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
      <AnimatedSection className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Tier FAQ</h2>
          <div className="space-y-4">
            {faqItems.map((faq, i) => (
              <details key={i} className="group card-elevated p-5 cursor-pointer">
                <summary className="font-semibold text-sm flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Tiers;
