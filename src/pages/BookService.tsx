import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MapPin, Package, Weight, Calculator, ArrowRight, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BookService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weight, setWeight] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: serviceTypes } = useQuery({
    queryKey: ["public-service-types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_types").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: pricingConfig } = useQuery({
    queryKey: ["public-pricing-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_config").select("*");
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach(c => { map[c.key] = Number(c.value); });
      return map;
    },
  });

  const { data: addons } = useQuery({
    queryKey: ["public-pricing-addons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_addons").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedService = serviceTypes?.find(s => s.id === serviceTypeId);

  const estimatedFee = useMemo(() => {
    if (!pricingConfig) return 0;
    const baseFee = pricingConfig.base_fee ?? 30;
    const perKg = pricingConfig.per_kg_rate ?? 5;
    const serviceBase = selectedService ? Number(selectedService.base_price) : 0;
    const weightCost = weight * perKg;
    const addonsCost = (addons ?? [])
      .filter(a => selectedAddons.includes(a.id))
      .reduce((s, a) => s + Number(a.price), 0);
    const minFee = pricingConfig.min_fee ?? 20;
    return Math.max(minFee, baseFee + serviceBase + weightCost + addonsCost);
  }, [pricingConfig, selectedService, weight, selectedAddons, addons]);

  const bookMutation = useMutation({
    mutationFn: async () => {
      const addonData = (addons ?? []).filter(a => selectedAddons.includes(a.id)).map(a => ({ id: a.id, name: a.name, price: a.price }));
      const { error } = await supabase.from("service_bookings").insert({
        user_id: user!.id,
        service_type_id: serviceTypeId || null,
        pickup,
        dropoff,
        weight,
        estimated_fee: estimatedFee,
        addons: addonData,
        notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Service booked successfully!");
    },
    onError: () => toast.error("Failed to book service"),
  });

  if (!user) {
    return (
      <>
        <SEOHead title="Book a Service" description="Book delivery services with DROPEE" path="/book" />
        <section className="hero-section py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Book a Service</h1>
            <p className="text-primary-foreground/70 mb-6">Sign in to book a delivery service</p>
            <Link to="/login"><Button variant="hero" size="lg">Sign In <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </section>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <SEOHead title="Booking Confirmed" description="Your service booking is confirmed" path="/book" />
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 max-w-md text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold mb-2">Booking Confirmed! 🎉</h1>
            <p className="text-muted-foreground mb-2">Estimated Fee: <span className="font-bold text-primary">₹{estimatedFee}</span></p>
            <p className="text-sm text-muted-foreground mb-6">We'll process your request shortly.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setSubmitted(false); setPickup(""); setDropoff(""); setWeight(0); setNotes(""); setSelectedAddons([]); setServiceTypeId(""); }}>Book Another</Button>
              <Button variant="outline" asChild><Link to="/dashboard">Dashboard</Link></Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Book a Service" description="Book delivery services with instant pricing at DROPEE" path="/book" />
      <section className="hero-section py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">
            Book a <span className="text-gradient-primary">Service</span>
          </h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70">Instant pricing. Fast delivery.</p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card-elevated p-5 sm:p-8 space-y-6">
            {/* Service type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Service Type</Label>
              <Select value={serviceTypeId} onValueChange={setServiceTypeId}>
                <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                <SelectContent>
                  {(serviceTypes ?? []).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — ₹{s.base_price} base</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pickup / Dropoff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> Pickup Location</Label>
                <Input placeholder="Enter pickup address" value={pickup} onChange={e => setPickup(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-destructive" /> Dropoff Location</Label>
                <Input placeholder="Enter dropoff address" value={dropoff} onChange={e => setDropoff(e.target.value)} />
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Weight className="w-4 h-4 text-primary" /> Weight (kg)</Label>
              <Input type="number" min={0} step={0.5} value={weight} onChange={e => setWeight(Number(e.target.value))} />
              {pricingConfig?.per_kg_rate && <p className="text-xs text-muted-foreground">₹{pricingConfig.per_kg_rate}/kg</p>}
            </div>

            {/* Add-ons */}
            {(addons ?? []).length > 0 && (
              <div className="space-y-3">
                <Label>Extra Add-ons</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(addons ?? []).map(a => (
                    <label key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedAddons.includes(a.id)}
                        onCheckedChange={(checked) => {
                          setSelectedAddons(prev => checked ? [...prev, a.id] : prev.filter(id => id !== a.id));
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.name}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">+₹{a.price}</Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>

            {/* Price Summary */}
            <motion.div
              layout
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Price Breakdown</span>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between"><span>Base fee</span><span>₹{pricingConfig?.base_fee ?? 30}</span></div>
                {selectedService && <div className="flex justify-between"><span>{selectedService.name} fee</span><span>₹{selectedService.base_price}</span></div>}
                {weight > 0 && <div className="flex justify-between"><span>Weight ({weight} kg × ₹{pricingConfig?.per_kg_rate ?? 5})</span><span>₹{weight * (pricingConfig?.per_kg_rate ?? 5)}</span></div>}
                {selectedAddons.length > 0 && (addons ?? []).filter(a => selectedAddons.includes(a.id)).map(a => (
                  <div key={a.id} className="flex justify-between"><span>{a.name}</span><span>₹{a.price}</span></div>
                ))}
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                <span className="font-semibold text-sm">Estimated Total</span>
                <span className="text-xl font-bold font-display text-primary">₹{estimatedFee}</span>
              </div>
            </motion.div>

            <Button
              size="lg"
              className="w-full h-12"
              disabled={!pickup || !dropoff || bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default BookService;
