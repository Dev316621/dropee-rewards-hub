import { useState } from "react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Truck, TreePine, Users, ArrowRight, CheckCircle, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const causes = [
  {
    id: "operations",
    icon: Truck,
    title: "Support DROPEE Operations",
    description: "Help us maintain and expand delivery services across Ukhrul — fuel, maintenance, and new routes.",
    raised: 12500,
    goal: 50000,
    color: "bg-primary",
  },
  {
    id: "community",
    icon: TreePine,
    title: "Green Ukhrul Initiative",
    description: "Fund eco-friendly packaging and sustainable delivery practices for a cleaner Ukhrul.",
    raised: 8200,
    goal: 30000,
    color: "bg-emerald-500",
  },
  {
    id: "drivers",
    icon: Users,
    title: "Tip the Drivers",
    description: "Show appreciation for our delivery partners who work rain or shine to serve Ukhrul.",
    raised: 4800,
    goal: 20000,
    color: "bg-secondary",
  },
];

const presetAmounts = [50, 100, 250, 500, 1000];

const Donate = () => {
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleDonate = () => {
    if (!amount || amount < 1) {
      toast.error("Please enter a valid amount");
      return;
    }
    // Placeholder — payment API will be integrated here
    toast.info("Payment gateway coming soon! Your donation will be processed once payments are connected.");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <SEOHead title="Thank You" description="Thank you for your donation to DROPEE" path="/donate" />
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 max-w-md text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3">Thank You! 💛</h1>
            <p className="text-muted-foreground mb-2">
              {selectedCause
                ? `Your ₹${amount} donation to "${causes.find(c => c.id === selectedCause)?.title}" is appreciated.`
                : `Your ₹${amount} donation means a lot to us.`}
            </p>
            <p className="text-sm text-muted-foreground mb-6">Payment will be processed once our payment gateway is live.</p>
            <Button onClick={() => { setSubmitted(false); setAmount(0); setSelectedCause(null); setName(""); setMessage(""); }}>
              Donate Again
            </Button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Donate" description="Support DROPEE's mission in Ukhrul — donate to operations, community initiatives, or tip delivery drivers." path="/donate" />

      {/* Hero */}
      <section className="hero-section py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-10 right-10 w-64 h-64 rounded-full bg-destructive blur-3xl"
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 bg-destructive/20 text-destructive border-destructive/30 text-xs">
              <Heart className="w-3 h-3 mr-1" /> Support Ukhrul
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
              Support <span className="text-gradient-primary">DROPEE</span>
            </h1>
            <p className="text-sm sm:text-lg text-primary-foreground/70 max-w-xl">
              Every contribution helps us serve Ukhrul better. Donate to a cause, tip a driver, or simply show your love.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Causes */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-center">Choose a Cause</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Select a campaign or make a general donation below</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
            {causes.map((cause, i) => {
              const percentage = Math.min(100, Math.round((cause.raised / cause.goal) * 100));
              const isSelected = selectedCause === cause.id;

              return (
                <motion.div
                  key={cause.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedCause(isSelected ? null : cause.id)}
                  className={`card-elevated p-5 sm:p-6 cursor-pointer transition-all duration-300 ${
                    isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/10" : "hover:shadow-xl"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <cause.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{cause.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">{cause.description}</p>

                  <div className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹{cause.raised.toLocaleString()} raised</span>
                      <span>₹{cause.goal.toLocaleString()} goal</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Donation Form */}
      <AnimatedSection className="py-10 sm:py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="card-elevated p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">
                {selectedCause
                  ? `Donate to: ${causes.find(c => c.id === selectedCause)?.title}`
                  : "General Donation"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedCause
                  ? "Your donation goes directly to this cause"
                  : "Select a cause above or make a general donation"}
              </p>
            </div>

            {/* Preset amounts */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {presetAmounts.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      amount === a
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs"><IndianRupee className="w-3 h-3" /> Custom Amount</Label>
              <Input
                type="number"
                min={1}
                placeholder="Enter amount"
                value={amount || ""}
                onChange={e => setAmount(Number(e.target.value))}
                className="text-lg font-bold h-12"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-xs">Your Name (optional)</Label>
              <Input placeholder="Anonymous" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-xs">Message (optional)</Label>
              <Textarea placeholder="Leave a kind message..." value={message} onChange={e => setMessage(e.target.value)} rows={3} />
            </div>

            {/* Summary */}
            {amount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Donation Amount</span>
                  <span className="text-xl font-bold font-display text-primary">₹{amount}</span>
                </div>
                {selectedCause && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    → {causes.find(c => c.id === selectedCause)?.title}
                  </p>
                )}
              </motion.div>
            )}

            <Button
              size="lg"
              className="w-full h-12 gap-2"
              disabled={!amount || amount < 1}
              onClick={handleDonate}
            >
              <Heart className="w-4 h-4" /> Donate ₹{amount || 0}
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Payment gateway will be connected soon. Your intent is recorded.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Donate;
