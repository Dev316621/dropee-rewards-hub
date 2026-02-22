import AnimatedSection from "@/components/AnimatedSection";
import { MapPin, Clock, Weight, Heart } from "lucide-react";

const schedules = {
  summer: [
    { slot: "Morning", time: "7:00 AM – 11:00 AM" },
    { slot: "Afternoon", time: "12:00 PM – 4:00 PM" },
    { slot: "Evening", time: "4:30 PM – 7:00 PM" },
  ],
  winter: [
    { slot: "Morning", time: "8:00 AM – 11:00 AM" },
    { slot: "Afternoon", time: "12:00 PM – 3:30 PM" },
    { slot: "Evening", time: "4:00 PM – 6:00 PM" },
  ],
};

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="hero-section py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              About <span className="text-gradient-primary">DROPEE</span>
            </h1>
            <p className="text-lg text-primary-foreground/70">
              Born in Ukhrul, built for the community. We're making local delivery simple, affordable, and rewarding.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-start gap-4 card-elevated p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower the people of Ukhrul with fast, reliable delivery — while making every order count through our loyalty-driven ecosystem. We believe that when you reward consistency, you build lasting relationships.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Coverage */}
      <AnimatedSection className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Coverage Area</h2>
              <p className="text-muted-foreground">
                DROPEE currently operates within Ukhrul town and its immediate surrounding areas in Manipur. We deliver door-to-door within our service boundary, covering the main market area, residential zones, and nearby villages within a 10km radius.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Delivery Schedules */}
      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">Delivery Time Slots</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {(["summer", "winter"] as const).map((season) => (
              <div key={season} className="card-elevated p-6">
                <h3 className="font-display font-semibold text-lg mb-4 capitalize">
                  {season === "summer" ? "☀️ Summer Schedule" : "❄️ Winter Schedule"}
                </h3>
                <div className="space-y-3">
                  {schedules[season].map((s) => (
                    <div key={s.slot} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="font-medium text-sm">{s.slot}</span>
                      <span className="text-sm text-muted-foreground">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Weight Rules */}
      <AnimatedSection className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Weight className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Weight & Pricing</h2>
              <p className="text-muted-foreground">
                Standard delivery rate applies for packages up to <strong>7 kg</strong>. For packages above 7 kg, an extra charge is applied per kilogram. This ensures fair pricing while keeping deliveries fast and efficient.
              </p>
            </div>
          </div>
          <div className="card-elevated p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="font-display text-2xl font-bold text-primary">≤ 7 kg</div>
                <p className="text-sm text-muted-foreground mt-1">Standard Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/5">
                <div className="font-display text-2xl font-bold text-secondary">&gt; 7 kg</div>
                <p className="text-sm text-muted-foreground mt-1">Extra per kg</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Brand Story */}
      <AnimatedSection className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            DROPEE started as a simple idea — what if deliveries in Ukhrul weren't just transactions, but a rewarding experience? We set out to build a delivery platform that values loyalty, celebrates milestones, and brings the community closer together. From our first delivery to thousands, every package tells a story of trust, speed, and commitment to Ukhrul.
          </p>
        </div>
      </AnimatedSection>
    </>
  );
};

export default About;
