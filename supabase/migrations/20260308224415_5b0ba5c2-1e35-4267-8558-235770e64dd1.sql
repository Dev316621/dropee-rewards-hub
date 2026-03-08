
-- Hub Websites (registered external sites with API keys)
CREATE TABLE public.hub_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label_color text NOT NULL DEFAULT '#3B82F6',
  api_key text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hub_websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage hub websites" ON public.hub_websites FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Hub Delivery Agents
CREATE TABLE public.hub_delivery_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hub_delivery_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage hub agents" ON public.hub_delivery_agents FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Hub Orders
CREATE TABLE public.hub_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES public.hub_websites(id) ON DELETE CASCADE,
  external_order_id text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_address text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  assigned_agent_id uuid REFERENCES public.hub_delivery_agents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hub_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage hub orders" ON public.hub_orders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
-- Allow anon SELECT for realtime subscriptions from external sites
CREATE POLICY "Anon can read hub orders" ON public.hub_orders FOR SELECT TO anon USING (true);

-- Trigger for updated_at
CREATE TRIGGER hub_orders_updated_at BEFORE UPDATE ON public.hub_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Hub Order Status Log (audit trail)
CREATE TABLE public.hub_order_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.hub_orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by text NOT NULL DEFAULT 'system',
  changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hub_order_status_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage hub status log" ON public.hub_order_status_log FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
-- Allow anon read for external site status history
CREATE POLICY "Anon can read hub status log" ON public.hub_order_status_log FOR SELECT TO anon USING (true);

-- Enable realtime on hub_orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.hub_orders;
