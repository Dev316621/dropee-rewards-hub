import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, ShoppingBag, Zap, Handshake, ArrowRight, Clock, IndianRupee, CheckCircle, MapPin, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AvailableAgents } from "@/components/AvailableAgents";

const iconMap: Record<string, any> = { Package, Truck, ShoppingBag, Zap, Handshake };

const fallbackServices = [
  { icon: Package, title: "Pick & Drop", description: "From documents to parcels, DROPEE picks up from any location in Ukhrul and drops it where you need.", base_price: 30, eta: "30–60 min", image_url: null as string | null },
  { icon: Truck, title: "Custom Delivery", description: "Fragile items, timed deliveries, or special handling — we customize the delivery experience.", base_price: 50, eta: "1–2 hrs", image_url: null as string | null },
  { icon: ShoppingBag, title: "Food & Grocery", description: "Fresh food and daily essentials from restaurants and local stores, right to your doorstep.", base_price: 25, eta: "20–45 min", image_url: null as string | null },
  { icon: Zap, title: "Instant Delivery", description: "Urgent delivery? Your package moves within minutes with priority handling.", base_price: 60, eta: "15–30 min", image_url: null as string | null },
  { icon: Handshake, title: "Business Partnership", description: "Bulk rates, dedicated support, and featured placement on our platform for your business.", base_price: 0, eta: "Contact us", image_url: null as string | null },
];

const Services = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [quickBookForm, setQuickBookForm] = useState({ pickup: "", dropoff: "", notes: "" });

  const { data: dbServices } = useQuery({
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

  const services = (dbServices && dbServices.length > 0)
    ? dbServices.map(s => ({
        id: s.id,
        icon: iconMap[s.icon || "Package"] || Package,
        title: s.name,
        description: s.description || "",
        base_price: Number(s.base_price),
        eta: s.description?.match(/(\d+.*min|hrs?|hour)/i)?.[0] || "30–60 min",
        image_url: (s as any).image_url || null,
      }))
    : fallbackServices.map((s, i) => ({ ...s, id: `fallback-${i}` }));

  const bookMutation = useMutation({
    mutationFn: async () => {
      const svc = services.find(s => s.id === selectedService);
      const { error } = await supabase.from("service_bookings").insert({
        user_id: user!.id,
        service_type_id: selectedService?.startsWith("fallback") ? null : selectedService,
        pickup: quickBookForm.pickup,
        dropoff: quickBookForm.dropoff,
        notes: quickBookForm.notes,
        estimated_fee: svc ? (pricingConfig?.base_fee ?? 30) + svc.base_price : 30,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking confirmed! We'll process it shortly.");
      setSelectedService(null);
      setQuickBookForm({ pickup: "", dropoff: "", notes: "" });
    },
    onError: () => toast.error("Booking failed. Please try again."),
  });

  const baseFee = pricingConfig?.base_fee ?? 30;

  return (
    <>
      <SEOHead title="Services" description="DROPEE delivery services in Ukhrul — Pick & Drop, Custom Delivery, Food & Grocery, Instant Delivery, and Business Partnerships." path="/services" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": services.map((s, i) => ({
          "@type": "Service", "position": i + 1, "name": s.title, "description": s.description,
          "provider": { "@type": "LocalBusiness", "name": "DROPEE", "address": { "@type": "PostalAddress", "addressLocality": "Ukhrul", "addressRegion": "Manipur" } },
        })),
      })}} />

      {/* Hero */}
      <section className="hero-section py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary blur-[80px]"
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-medium mb-5 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Fast & Reliable
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-[1.1]">
              Our <span className="text-gradient-primary">Services</span>
            </h1>
            <p className="text-sm sm:text-lg text-primary-foreground/60 max-w-xl mb-6 leading-relaxed">
              Everything you need, delivered. From instant parcels to business partnerships — all with transparent pricing.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-primary-foreground/40">
              <span className="flex items-center gap-1.5 bg-primary-foreground/5 px-3 py-1 rounded-full border border-primary-foreground/10"><Clock className="w-3.5 h-3.5 text-primary/60" /> 15 min fastest</span>
              <span className="flex items-center gap-1.5 bg-primary-foreground/5 px-3 py-1 rounded-full border border-primary-foreground/10"><IndianRupee className="w-3.5 h-3.5 text-primary/60" /> From ₹{baseFee}</span>
              <span className="flex items-center gap-1.5 bg-primary-foreground/5 px-3 py-1 rounded-full border border-primary-foreground/10"><MapPin className="w-3.5 h-3.5 text-primary/60" /> Ukhrul</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Cards */}
      <AnimatedSection className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, i) => {
              const isSelected = selectedService === service.id;
              const totalPrice = baseFee + service.base_price;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  layout
                  className={`card-elevated p-5 sm:p-6 group cursor-pointer transition-all duration-300 ${isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/10 !translate-y-0" : ""}`}
                  onClick={() => setSelectedService(isSelected ? null : service.id)}
                >
                  {/* Service Image */}
                  {service.image_url && (
                    <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden mb-4 relative">
                      <img src={service.image_url} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                    </div>
                  )}

                  {!service.image_url && (
                    <div className="flex items-start justify-between mb-4">
                      <div className="icon-box w-13 h-13 sm:w-14 sm:h-14">
                        <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      {service.base_price > 0 && (
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold font-display text-primary">₹{totalPrice}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">starting price</p>
                        </div>
                      )}
                    </div>
                  )}

                  {service.image_url && (
                    <div className="flex items-start justify-between mb-2">
                      <div className="icon-box w-9 h-9">
                        <service.icon className="w-4 h-4 text-primary" />
                      </div>
                      {service.base_price > 0 && (
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold font-display text-primary">₹{totalPrice}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">starting price</p>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="font-display text-lg sm:text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> {service.eta}</span>
                      <Badge variant="outline" className="text-[10px] border-success/30 text-success rounded-full px-2">
                        <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Available
                      </Badge>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-primary transition-transform duration-300 ${isSelected ? "rotate-90" : "group-hover:translate-x-1"}`} />
                  </div>

                  {/* Inline Quick Book */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="border-t border-border mt-4 pt-4 space-y-3">
                          {!user ? (
                            <div className="text-center py-3">
                              <p className="text-xs text-muted-foreground mb-3">Sign in to book this service</p>
                              <Link to="/login"><Button size="sm" variant="outline" className="text-xs rounded-xl">Sign In</Button></Link>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 gap-2">
                                <div>
                                  <Label className="text-[10px] flex items-center gap-1 mb-1"><MapPin className="w-3 h-3 text-success" />Pickup</Label>
                                  <Input placeholder="Pickup address" value={quickBookForm.pickup} onChange={e => setQuickBookForm(f => ({ ...f, pickup: e.target.value }))} className="h-9 text-xs rounded-xl" />
                                </div>
                                <div>
                                  <Label className="text-[10px] flex items-center gap-1 mb-1"><MapPin className="w-3 h-3 text-destructive" />Dropoff</Label>
                                  <Input placeholder="Dropoff address" value={quickBookForm.dropoff} onChange={e => setQuickBookForm(f => ({ ...f, dropoff: e.target.value }))} className="h-9 text-xs rounded-xl" />
                                </div>
                              </div>
                              <Textarea placeholder="Notes (optional)" value={quickBookForm.notes} onChange={e => setQuickBookForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="text-xs rounded-xl" />
                              <Button
                                size="sm"
                                className="w-full text-xs rounded-xl"
                                disabled={!quickBookForm.pickup || !quickBookForm.dropoff || bookMutation.isPending}
                                onClick={() => bookMutation.mutate()}
                              >
                                {bookMutation.isPending ? "Booking..." : `Book Now — ₹${totalPrice}`}
                              </Button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Available Agents */}
      <AnimatedSection className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <AvailableAgents title="Our Delivery Agents" showDeliveryFee={false} />
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Zones Map */}
      <PricingZonesSection />

      {/* CTA */}
      <AnimatedSection className="py-12 sm:py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 border border-primary/10">
            Custom Orders
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Need Something Custom?</h2>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
            Use our full booking page for detailed options, add-ons, and weight-based pricing.
          </p>
          <Link to="/book">
            <Button variant="hero" size="lg" className="w-full sm:w-auto h-12 sm:h-auto text-sm sm:text-base rounded-2xl">
              Full Booking Page <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </>
  );
};

// Pricing zones map section using Leaflet
const PricingZonesSection = () => {
  const { data: zones } = useQuery({
    queryKey: ["public-pricing-zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_zones").select("*").eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!zones || zones.length === 0) return null;

  return (
    <AnimatedSection className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3 border border-primary/10">
            <MapPin className="w-3.5 h-3.5" /> Coverage
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Delivery Zones</h2>
          <p className="text-sm text-muted-foreground">See our coverage areas and pricing multipliers across Ukhrul</p>
        </div>
        <div className="card-elevated overflow-hidden">
          <ZoneMap zones={zones} />
          <div className="p-4 sm:p-5 flex flex-wrap gap-3 border-t border-border">
            {zones.map(z => (
              <div key={z.id} className="flex items-center gap-2 text-xs bg-muted px-3 py-1.5 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: z.color || "#FF6B35" }} />
                <span className="font-medium">{z.name}</span>
                <span className="text-muted-foreground">({Number(z.multiplier)}×, {z.radius_km}km)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Lazy-loaded map component
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ZoneMap = ({ zones }: { zones: any[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([25.097, 94.361], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    zones.forEach(z => {
      L.circle([z.center_lat, z.center_lng], {
        radius: z.radius_km * 1000,
        color: z.color || "#FF6B35",
        fillColor: z.color || "#FF6B35",
        fillOpacity: 0.15,
        weight: 2,
      })
        .bindPopup(`<strong>${z.name}</strong><br>${Number(z.multiplier)}× rate<br>${z.radius_km}km radius`)
        .addTo(map);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [zones]);

  return <div ref={mapRef} className="w-full h-64 sm:h-80 md:h-96" />;
};

export default Services;
