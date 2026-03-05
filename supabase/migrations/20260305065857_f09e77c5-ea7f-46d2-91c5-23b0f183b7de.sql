
-- spin_preset_wins table
CREATE TABLE public.spin_preset_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spin_type TEXT NOT NULL DEFAULT 'daily',
  slot_id UUID NOT NULL REFERENCES public.spin_slots(id) ON DELETE CASCADE,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spin_preset_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage preset wins" ON public.spin_preset_wins FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own preset wins" ON public.spin_preset_wins FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- api_integrations table
CREATE TABLE public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL DEFAULT '',
  api_key_encrypted TEXT DEFAULT '',
  headers_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage api integrations" ON public.api_integrations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- tracked_orders table
CREATE TABLE public.tracked_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  external_order_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  last_response JSONB DEFAULT NULL,
  tracking_url TEXT DEFAULT '',
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracked_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tracked orders" ON public.tracked_orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own tracked orders" ON public.tracked_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Enable realtime on tracked_orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracked_orders;
