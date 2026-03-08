
-- Products table for shop
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  product_type TEXT NOT NULL DEFAULT 'physical', -- physical or digital
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  digital_file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (is_active = true);

-- Shop orders table
CREATE TABLE public.shop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  total NUMERIC NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]',
  delivery_address TEXT DEFAULT '',
  plus_code TEXT,
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage shop orders" ON public.shop_orders FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own shop orders" ON public.shop_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shop orders" ON public.shop_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service bookings table
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type_id UUID REFERENCES public.service_types(id),
  pickup TEXT NOT NULL,
  dropoff TEXT NOT NULL,
  weight NUMERIC DEFAULT 0,
  estimated_fee NUMERIC DEFAULT 0,
  addons JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage service bookings" ON public.service_bookings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own service bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own service bookings" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime on service bookings and shop orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_orders;
