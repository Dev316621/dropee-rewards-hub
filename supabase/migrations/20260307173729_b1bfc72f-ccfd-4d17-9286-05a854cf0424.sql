
-- 1. Add plus_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plus_code text;

-- 2. pricing_config table
CREATE TABLE public.pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage pricing config" ON public.pricing_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read pricing config" ON public.pricing_config FOR SELECT USING (true);

-- 3. pricing_addons table
CREATE TABLE public.pricing_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage pricing addons" ON public.pricing_addons FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read pricing addons" ON public.pricing_addons FOR SELECT USING (true);

-- 4. pricing_zones table
CREATE TABLE public.pricing_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  center_lat double precision NOT NULL DEFAULT 25.097,
  center_lng double precision NOT NULL DEFAULT 94.361,
  radius_km double precision NOT NULL DEFAULT 5,
  multiplier numeric NOT NULL DEFAULT 1.0,
  color text DEFAULT '#FF6B35',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage pricing zones" ON public.pricing_zones FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read pricing zones" ON public.pricing_zones FOR SELECT USING (true);

-- 5. service_types table
CREATE TABLE public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'Package',
  base_price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage service types" ON public.service_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active service types" ON public.service_types FOR SELECT USING (is_active = true);

-- 6. live_orders table
CREATE TABLE public.live_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type_id uuid REFERENCES public.service_types(id) ON DELETE SET NULL,
  pickup text NOT NULL,
  dropoff text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  notes text DEFAULT '',
  estimated_fee numeric DEFAULT 0,
  assigned_to text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.live_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all live orders" ON public.live_orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own live orders" ON public.live_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own live orders" ON public.live_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime on live_orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_orders;

-- 7. Seed default pricing config
INSERT INTO public.pricing_config (key, value, label) VALUES
  ('base_fee', 30, 'Base Fee (₹)'),
  ('per_km_rate', 10, 'Rate per KM (₹)'),
  ('per_kg_rate', 5, 'Rate per KG (₹)'),
  ('min_fee', 20, 'Minimum Fee (₹)');

-- 8. Seed default service types
INSERT INTO public.service_types (name, description, icon, base_price, display_order) VALUES
  ('Pick & Drop', 'From documents to parcels, DROPEE picks up from any location in Ukhrul and drops it where you need.', 'Package', 30, 1),
  ('Custom Delivery', 'Fragile items, timed deliveries, or special handling — we customize the delivery experience.', 'Truck', 50, 2),
  ('Food & Grocery', 'Fresh food and daily essentials from restaurants and local stores, right to your doorstep.', 'ShoppingBag', 25, 3),
  ('Instant Delivery', 'Urgent delivery? Your package moves within minutes with priority handling.', 'Zap', 60, 4),
  ('Business Partnership', 'Bulk rates, dedicated support, and featured placement on our platform for your business.', 'Handshake', 0, 5);
