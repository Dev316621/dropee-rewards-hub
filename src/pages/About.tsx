import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { MapPin, Clock, Weight, Heart, Users, Zap, Shield, Star } from "lucide-react";

const schedules = {
  summer: [
    { slot: "Morning", time: "7:00 AM – 11:00 AM", icon: "🌅" },
    { slot: "Afternoon", time: "12:00 PM – 4:00 PM", icon: "☀️" },
    { slot: "Evening", time: "4:30 PM – 7:00 PM", icon: "🌇" },
  ],
  winter: [
    { slot: "Morning", time: "8:00 AM – 11:00 AM", icon: "🌅" },
    { slot: "Afternoon", time: "12:00 PM – 3:30 PM", icon: "❄️" },
    { slot: "Evening", time: "4:00 PM – 6:00 PM", icon: "🌆" },
  ],
};

const values = [
  { icon: Zap, title: "Lightning Fast", desc: "Same-day delivery across Ukhrul town", color: "text-primary" },
  { icon: Shield, title: "Safe & Secure", desc: "Every package handled with care", color: "text-secondary" },
  { icon: Users, title: "Community First", desc: "Built by locals, for locals", color: "text-primary" },
  { icon: Star, title: "Rewarding", desc: "Earn points on every delivery", color: "text-secondary" },
];

const About = () => {
  return (
    <>
      <SEOHead title="About DROPEE" description="Learn about DROPEE — Ukhrul's community delivery service. Coverage area, delivery schedules, pricing, and our story." path="/about" />

      {/* Hero */}
      <section className="hero-section py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] w-48 h-48 rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-primary-foreground text-[10px] sm:text-xs font-semibold mb-4">
              <Heart className="w-3 h-3" /> Born in Ukhrul
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
              About <span className="text-gradient-primary">DROPEE</span>
            </h1>
            <p className="text-sm sm:text-lg text-primary-foreground/70 leading-relaxed">
              Built for the community. Making local delivery simple, affordable, and rewarding — one package at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <AnimatedSection className="py-10 sm:py-16 -mt-8 sm:-mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-4 sm:p-5 text-center group"
              >
                <div className="icon-box w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2.5 sm:mb-3">
                  <v.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${v.color}`} />
                </div>
                <h3 className="font-display font-bold text-xs sm:text-sm mb-0.5">{v.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Mission */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="gradient-border">
            <div className="p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                <div className="icon-box w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Our Mission</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    To empower the people of Ukhrul with fast, reliable delivery — while making every order count through our loyalty-driven ecosystem. We believe every delivery is an opportunity to build trust and reward our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Coverage */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="icon-box w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Coverage Area</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                DROPEE operates within Ukhrul town and its surrounding areas in Manipur. Door-to-door within our service boundary, covering the main market, residential zones, and nearby villages within 10km.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Main Market", emoji: "🏪" },
              { label: "Residential", emoji: "🏠" },
              { label: "Villages (10km)", emoji: "🌄" },
            ].map((zone, i) => (
              <motion.div
                key={zone.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-3 sm:p-4 text-center"
              >
                <span className="text-xl sm:text-2xl mb-1 block">{zone.emoji}</span>
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{zone.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Delivery Time Slots */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="icon-box w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold">Delivery Time Slots</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {(["summer", "winter"] as const).map((season, si) => (
              <motion.div
                key={season}
                initial={{ opacity: 0, x: si === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: si * 0.15 }}
                className="card-elevated overflow-hidden"
              >
                <div className={`p-4 sm:p-5 ${season === "summer" ? "bg-primary/5 border-b border-primary/10" : "bg-secondary/5 border-b border-secondary/10"}`}>
                  <h3 className="font-display font-bold text-base sm:text-lg">
                    {season === "summer" ? "☀️ Summer Schedule" : "❄️ Winter Schedule"}
                  </h3>
                </div>
                <div className="p-4 sm:p-5 space-y-0">
                  {schedules[season].map((s) => (
                    <div key={s.slot} className="flex justify-between items-center py-2.5 sm:py-3 border-b border-border/50 last:border-0">
                      <span className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                        <span>{s.icon}</span> {s.slot}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground font-mono">{s.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Weight & Pricing */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="icon-box w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <Weight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Weight & Pricing</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Standard delivery rate applies for packages up to <strong>7 kg</strong>. Extra charge per kg above 7 kg.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="card-elevated p-5 sm:p-6 text-center group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                <span className="font-display text-xl sm:text-2xl font-bold text-primary">≤7</span>
              </div>
              <p className="font-display font-bold text-sm sm:text-base">Standard</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Up to 7 kg</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-5 sm:p-6 text-center group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/15 transition-colors">
                <span className="font-display text-xl sm:text-2xl font-bold text-secondary">&gt;7</span>
              </div>
              <p className="font-display font-bold text-sm sm:text-base">Extra/kg</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Above 7 kg</p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Story */}
      <AnimatedSection className="py-12 sm:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-3xl sm:text-4xl mb-4 block">📖</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Our Story</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              DROPEE started as a simple idea — what if deliveries in Ukhrul weren't just transactions, but a rewarding experience? We set out to build a delivery platform that values loyalty, celebrates milestones, and brings the community closer together.
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-primary" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default About;
