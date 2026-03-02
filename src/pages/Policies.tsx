import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { ChevronRight } from "lucide-react";
import { usePolicySections, useFaqs } from "@/hooks/useContentData";

const Policies = () => {
  const { data: policies = [] } = usePolicySections();
  const { data: faqs = [] } = useFaqs();

  return (
    <>
      <SEOHead title="Policies" description="DROPEE delivery terms, weight charges, refund policy, and loyalty policy. Clear, fair, and transparent." path="/policies" />
      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } })),
        })}} />
      )}

      <section className="hero-section py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3">Policies</h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70">Clear, fair, and transparent terms.</p>
        </div>
      </section>

      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-3 sm:space-y-4">
          {policies.map((policy) => (
            <details key={policy.id} className="group card-elevated p-4 sm:p-6 cursor-pointer touch-manipulation">
              <summary className="font-display font-semibold text-base sm:text-lg flex items-center justify-between list-none gap-2">
                <span>{policy.title}</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
              </summary>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">{policy.content}</p>
            </details>
          ))}
        </div>
      </AnimatedSection>

      {faqs.length > 0 && (
        <AnimatedSection className="py-10 sm:py-16 bg-muted">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-center">Policy FAQ</h2>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq) => (
                <details key={faq.id} className="group card-elevated p-4 sm:p-5 cursor-pointer touch-manipulation">
                  <summary className="font-semibold text-sm flex items-center justify-between list-none gap-2">
                    <span>{faq.question}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                  </summary>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}
    </>
  );
};

export default Policies;
