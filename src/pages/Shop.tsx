import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight, CheckCircle, Search, ShoppingBag, ExternalLink, Star, Clock, Ticket, Tag, CreditCard } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Link } from "react-router-dom";

type CartItem = { id: string; name: string; price: number; image_url: string | null; qty: number; product_type: string };

// Countdown hook
const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, expired: true });
  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, expired: true }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
};

const CountdownBadge = ({ expiresAt }: { expiresAt: string }) => {
  const { days, hours, mins, secs, expired } = useCountdown(expiresAt);
  if (expired) return null;
  return (
    <div className="flex items-center gap-1 text-[10px] font-mono text-destructive">
      <Clock className="w-3 h-3" />
      {days > 0 && <span>{days}d</span>}
      <span>{String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
    </div>
  );
};

const getEffectivePrice = (product: any) => {
  const hasDiscount = product.discount_percent > 0 && product.discount_expires_at && new Date(product.discount_expires_at).getTime() > Date.now();
  if (hasDiscount) return Number(product.price) * (1 - Number(product.discount_percent) / 100);
  return Number(product.price);
};

const Shop = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const { pay } = useRazorpay();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: coupons } = useQuery({
    queryKey: ["public-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").eq("is_active", true).eq("is_public", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const maxPrice = useMemo(() => Math.max(...(products ?? []).map(p => Number(p.price)), 100), [products]);

  const categories = useMemo(() => {
    const cats = new Set((products ?? []).map(p => p.category || "general"));
    return ["all", ...Array.from(cats)];
  }, [products]);

  const featured = useMemo(() => (products ?? []).filter(p => p.is_featured), [products]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (category !== "all") list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    list = list.filter(p => {
      const ep = getEffectivePrice(p);
      return ep >= priceRange[0] && ep <= priceRange[1];
    });
    if (sortBy === "price_low") list = [...list].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    else if (sortBy === "price_high") list = [...list].sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    else if (sortBy === "newest") list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "discount") list = [...list].sort((a, b) => Number(b.discount_percent || 0) - Number(a.discount_percent || 0));
    return list;
  }, [products, category, search, sortBy, priceRange]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const finalTotal = Math.max(0, cartTotal - couponDiscount);

  const addToCart = (product: any) => {
    const ep = Math.round(getEffectivePrice(product));
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: ep, image_url: product.image_url, qty: 1, product_type: product.product_type }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const coupon = (coupons ?? []).find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (!coupon) { toast.error("Invalid coupon code"); return; }
    if (coupon.expiry_date && new Date(coupon.expiry_date).getTime() < Date.now()) { toast.error("Coupon expired"); return; }
    if (coupon.max_uses && coupon.current_uses && coupon.current_uses >= coupon.max_uses) { toast.error("Coupon fully redeemed"); return; }
    const discount = coupon.discount_type === "percentage" ? cartTotal * (Number(coupon.discount_value) / 100) : Number(coupon.discount_value);
    setCouponDiscount(Math.round(Math.min(discount, cartTotal)));
    setCouponApplied(true);
    toast.success(`Coupon applied! ₹${Math.round(Math.min(discount, cartTotal))} off`);
  };

  const placeMutation = useMutation({
    mutationFn: async () => {
      const orderItems = cart.map(i => ({ product_id: i.id, name: i.name, price: i.price, qty: i.qty, product_type: i.product_type }));
      const { data: shopOrder, error } = await supabase.from("shop_orders").insert({
        user_id: user!.id,
        total: finalTotal,
        items: orderItems,
        delivery_address: address,
        phone,
        notes: orderNotes + (couponApplied ? ` [Coupon: ${couponCode}]` : ""),
      }).select("id").single();
      if (error) throw error;

      // Also forward to the Order Hub for centralized tracking
      const profile = await supabase.from("profiles").select("full_name, phone").eq("user_id", user!.id).single();
      try {
        await supabase.functions.invoke("hub-receive-order", {
          body: {
            _internal: true,
            website_name: "Dropee",
            external_order_id: shopOrder.id,
            customer_name: profile.data?.full_name || "Customer",
            customer_phone: profile.data?.phone || phone,
            customer_address: address,
            items: orderItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
            total: finalTotal,
            notes: orderNotes,
          },
        });
      } catch {
        // Hub forwarding is non-critical — don't block the order
        console.warn("Hub forwarding failed, order still placed");
      }
    },
    onSuccess: () => {
      setOrderPlaced(true);
      setCart([]);
      setCheckoutOpen(false);
      setCouponCode(""); setCouponDiscount(0); setCouponApplied(false);
      toast.success("Order placed!");
    },
    onError: () => toast.error("Failed to place order"),
  });

  const ProductCard = ({ product, i }: { product: any; i: number }) => {
    const hasDiscount = product.discount_percent > 0 && product.discount_expires_at && new Date(product.discount_expires_at).getTime() > Date.now();
    const effectivePrice = Math.round(getEffectivePrice(product));
    const originalPrice = hasDiscount ? Number(product.original_price || product.price) : null;

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="card-elevated overflow-hidden group"
      >
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <Badge className="text-[10px]" variant="secondary">
              {product.product_type === "digital" ? "Digital" : "Physical"}
            </Badge>
            {product.is_featured && (
              <Badge className="text-[10px] bg-primary/90 text-primary-foreground gap-0.5"><Star className="w-2.5 h-2.5" /> Featured</Badge>
            )}
          </div>
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 text-[10px] bg-destructive text-destructive-foreground gap-0.5">
              <Tag className="w-2.5 h-2.5" /> {product.discount_percent}% OFF
            </Badge>
          )}
          {product.stock !== null && product.stock <= 0 && product.product_type === "physical" && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-destructive">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
          <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>

          {/* Countdown */}
          {hasDiscount && product.discount_expires_at && (
            <div className="mb-2">
              <CountdownBadge expiresAt={product.discount_expires_at} />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-primary font-display">₹{effectivePrice}</span>
            {originalPrice && originalPrice > effectivePrice && (
              <span className="text-xs text-muted-foreground line-through">₹{originalPrice}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 gap-1 flex-1"
              disabled={(product.product_type === "physical" && product.stock !== null && product.stock <= 0) || !user}
              onClick={() => addToCart(product)}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
            {product.external_url && (
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setIframeUrl(product.external_url)}>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <SEOHead title="Shop" description="Browse and shop products at DROPEE — discounts, deals, physical goods and digital items delivered to you." path="/shop" />

      <section className="hero-section py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">
            <span className="text-gradient-primary">Shop</span>
          </h1>
          <p className="text-sm sm:text-lg text-primary-foreground/70">Browse products, grab deals & place orders</p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">

          {/* Featured Products */}
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" /> Featured
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {featured.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} i={i} />)}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price_low">Price: Low → High</SelectItem>
                  <SelectItem value="price_high">Price: High → Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="discount">Biggest Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                {categories.map(c => (
                  <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className="capitalize whitespace-nowrap" onClick={() => setCategory(c)}>
                    {c}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-56">
                <span className="text-xs text-muted-foreground whitespace-nowrap">₹{priceRange[0]}</span>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">₹{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* All Products */}
          <h2 className="font-display text-lg font-bold mb-4">All Products</h2>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map((product, i) => <ProductCard key={product.id} product={product} i={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 lg:bottom-6 right-4 z-40"
          >
            <Button size="lg" className="h-14 px-6 rounded-full shadow-lg gap-3" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">{cartCount}</span>
              <span className="hidden sm:inline">— ₹{cartTotal}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Your Cart</DialogTitle>
          </DialogHeader>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Cart is empty</p>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div className="border-t pt-3 space-y-3">
              {/* Coupon */}
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value); if (couponApplied) { setCouponApplied(false); setCouponDiscount(0); } }}
                  className="flex-1 font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={applyCoupon} disabled={couponApplied} className="gap-1">
                  <Ticket className="w-3.5 h-3.5" /> {couponApplied ? "Applied" : "Apply"}
                </Button>
              </div>
              {couponApplied && <p className="text-xs text-green-500">-₹{couponDiscount} coupon discount</p>}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <div className="text-right">
                  {couponDiscount > 0 && <span className="text-xs text-muted-foreground line-through mr-2">₹{cartTotal}</span>}
                  <span className="text-primary font-display">₹{finalTotal}</span>
                </div>
              </div>
              {user ? (
                <Button className="w-full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button className="w-full" asChild><Link to="/login">Sign in to Checkout</Link></Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Checkout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Delivery Address</Label><Input placeholder="Your delivery address" value={address} onChange={e => setAddress(e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="Your phone number" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>Notes (optional)</Label><Textarea placeholder="Special instructions..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={2} /></div>
            <div className="bg-muted rounded-lg p-3 space-y-1">
              {cart.map(i => (
                <div key={i.id} className="flex justify-between text-xs">
                  <span>{i.name} × {i.qty}</span>
                  <span>₹{i.price * i.qty}</span>
                </div>
              ))}
              {couponDiscount > 0 && <div className="flex justify-between text-xs text-green-500"><span>Coupon discount</span><span>-₹{couponDiscount}</span></div>}
              <div className="border-t pt-1 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span className="text-primary">₹{finalTotal}</span>
              </div>
            </div>
            <Button className="w-full" disabled={!address || !phone || placeMutation.isPending} onClick={() => placeMutation.mutate()}>
              {placeMutation.isPending ? "Placing Order..." : "Place Order"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Payment will be collected on delivery</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={orderPlaced} onOpenChange={setOrderPlaced}>
        <DialogContent className="max-w-sm text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mt-4" />
          <h2 className="text-xl font-bold font-display">Order Placed! 🎉</h2>
          <p className="text-sm text-muted-foreground">We'll process your order shortly. Payment on delivery.</p>
          <div className="flex gap-3 justify-center pb-2">
            <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
            <Button variant="outline" onClick={() => setOrderPlaced(false)}>Continue Shopping</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* External Site Iframe Modal */}
      <AnimatePresence>
        {iframeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-2 min-w-0">
                <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{iframeUrl}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" asChild>
                  <a href={iframeUrl} target="_blank" rel="noopener noreferrer" className="gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIframeUrl(null)}>
                  ✕ Close
                </Button>
              </div>
            </div>
            <iframe
              src={iframeUrl}
              className="flex-1 w-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              title="External shop"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Shop;
