
-- Policy sections for the Policies page
CREATE TABLE public.policy_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active policies" ON public.policy_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage policies" ON public.policy_sections FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_policy_sections_updated_at BEFORE UPDATE ON public.policy_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQs
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active faqs" ON public.faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Footer quick links
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '/',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active footer links" ON public.footer_links FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage footer links" ON public.footer_links FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Site settings (key-value for contact info, etc.)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default contact info
INSERT INTO public.site_settings (key, value) VALUES
  ('contact_address', 'Ukhrul, Manipur'),
  ('contact_phone', '+91 XXXXX XXXXX'),
  ('contact_email', 'hello@dropee.in');

-- Seed default footer links
INSERT INTO public.footer_links (label, url, display_order) VALUES
  ('About Us', '/about', 1),
  ('Services', '/services', 2),
  ('Loyalty Tiers', '/tiers', 3),
  ('Offers', '/offers', 4),
  ('Blog', '/blog', 5);

-- Seed default policy sections
INSERT INTO public.policy_sections (title, content, display_order) VALUES
  ('Delivery Terms', 'Standard delivery terms content here.', 1),
  ('Weight Charges', 'Weight charge details here.', 2),
  ('Refund Policy', 'Refund policy details here.', 3),
  ('Loyalty Policy', 'Loyalty policy details here.', 4);
