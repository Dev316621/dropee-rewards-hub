import AnimatedSection from "@/components/AnimatedSection";
import { ChevronRight } from "lucide-react";

const policies = [
  {
    title: "Delivery Terms",
    content: `DROPEE operates within Ukhrul, Manipur. All deliveries are subject to availability and weather conditions. Delivery times are estimates and may vary during peak hours or adverse weather. We reserve the right to refuse delivery of prohibited or hazardous items. All items must be properly packaged before handover. DROPEE is not responsible for damage caused by inadequate packaging by the sender.`,
  },
  {
    title: "Weight Charges",
    content: `Standard delivery rates apply for packages weighing up to 7 kg. For packages exceeding 7 kg, an additional charge per kilogram above the 7 kg threshold will be applied. The weight is measured at the time of pickup. If there is a discrepancy between the declared weight and actual weight, the actual weight will be used for pricing. Overweight surcharges are non-refundable.`,
  },
  {
    title: "Refund Policy",
    content: `Refunds are processed only in cases where DROPEE fails to deliver due to our own fault (e.g., lost package, significant delay beyond acceptable limits). Refund requests must be submitted within 48 hours of the expected delivery time. Loyalty points earned from refunded deliveries will be deducted. Free delivery credits are non-refundable but may be re-issued at our discretion. Refunds are processed within 5–7 business days.`,
  },
  {
    title: "Loyalty Policy",
    content: `Users earn 2 loyalty points for every completed delivery. 20 loyalty points can be redeemed for 1 free delivery. Points are non-transferable and have no cash value. Loyalty tier upgrades are based on total completed deliveries. Tier benefits are subject to change with prior notice. DROPEE reserves the right to adjust point values or redemption rates with advance notice to users. Fraudulent activity will result in account suspension and forfeiture of all earned points.`,
  },
];

const faqItems = [
  { q: "What are delivery charges in Ukhrul?", a: "DROPEE offers standard delivery for packages up to 7kg. Additional weight is charged per kilogram above 7kg. Contact us or check our Policies page for current rates." },
  { q: "Can I get a refund for a failed delivery?", a: "Yes, if DROPEE fails to deliver due to our fault, you can request a refund within 48 hours. Refunds are processed in 5-7 business days." },
  { q: "How do loyalty points work with DROPEE?", a: "You earn 2 points for every delivery completed. Points accumulate toward free deliveries (20 points = 1 free delivery), tier upgrades, and exclusive rewards." },
  { q: "Are loyalty points transferable?", a: "No, loyalty points are tied to your account and cannot be transferred to another user." },
];

const Policies = () => {
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
            Policies
          </h1>
          <p className="text-lg text-primary-foreground/70">
            Clear, fair, and transparent — everything you need to know about DROPEE's terms.
          </p>
        </div>
      </section>

      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          {policies.map((policy) => (
            <details key={policy.title} className="group card-elevated p-6 cursor-pointer">
              <summary className="font-display font-semibold text-lg flex items-center justify-between list-none">
                {policy.title}
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {policy.content}
              </p>
            </details>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">Policy FAQ</h2>
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

export default Policies;
