import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { ChevronRight } from "lucide-react";

const policies = [
  { title: "Delivery Terms", content: `DROPEE operates within Ukhrul, Manipur. All deliveries are subject to availability and weather conditions. Delivery times are estimates and may vary during peak hours or adverse weather. We reserve the right to refuse delivery of prohibited or hazardous items. All items must be properly packaged before handover.` },
  { title: "Weight Charges", content: `Standard delivery rates apply for packages weighing up to 7 kg. For packages exceeding 7 kg, an additional charge per kilogram above the 7 kg threshold will be applied. The weight is measured at the time of pickup. Overweight surcharges are non-refundable.` },
  { title: "Refund Policy", content: `Refunds are processed only when DROPEE fails to deliver due to our own fault. Requests must be submitted within 48 hours. Loyalty points from refunded deliveries will be deducted. Free delivery credits are non-refundable. Refunds are processed within 5–7 business days.` },
  { title: "Loyalty Policy", content: `Users earn 2 loyalty points for every completed delivery. 20 loyalty points can be redeemed for 1 free delivery. Points are non-transferable and have no cash value. DROPEE reserves the right to adjust point values with advance notice. Fraudulent activity results in account suspension.` },
];

const faqItems = [
  { q: "What are delivery charges in Ukhrul?", a: "Standard delivery for packages up to 7kg. Additional weight charged per kg above 7kg." },
  { q: "Can I get a refund for a failed delivery?", a: "Yes, if DROPEE fails to deliver due to our fault. Request within 48 hours." },
  { q: "How do loyalty points work?", a: "2 points per delivery. 20 points = 1 free delivery." },
  { q: "Are loyalty points transferable?", a: "No, points are tied to your account." },
];

const Policies = () => {
  return (
    <>
      <SEOHead title="Policies" description="DROPEE delivery terms, weight charges, refund policy, and loyalty policy. Clear, fair, and transparent." path="/policies" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqItems.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
      })}} />

      <section className="hero-section py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3">Policies</h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70">Clear, fair, and transparent terms.</p>
        </div>
      </section>

      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-3 sm:space-y-4">
          {policies.map((policy) => (
            <details key={policy.title} className="group card-elevated p-4 sm:p-6 cursor-pointer touch-manipulation">
              <summary className="font-display font-semibold text-base sm:text-lg flex items-center justify-between list-none gap-2">
                <span>{policy.title}</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
              </summary>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">{policy.content}</p>
            </details>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-center">Policy FAQ</h2>
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

export default Policies;
