
-- Operating hours table (daily open/close times)
CREATE TABLE public.operating_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time NOT NULL DEFAULT '09:00',
  close_time time NOT NULL DEFAULT '18:00',
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Delivery time slots
CREATE TABLE public.delivery_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  max_orders integer DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Holidays / off-days
CREATE TABLE public.delivery_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_holidays ENABLE ROW LEVEL SECURITY;

-- Admin manage policies
CREATE POLICY "Admins can manage operating hours" ON public.operating_hours FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read operating hours" ON public.operating_hours FOR SELECT USING (true);

CREATE POLICY "Admins can manage delivery time slots" ON public.delivery_time_slots FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read delivery time slots" ON public.delivery_time_slots FOR SELECT USING (true);

CREATE POLICY "Admins can manage delivery holidays" ON public.delivery_holidays FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read delivery holidays" ON public.delivery_holidays FOR SELECT USING (true);

-- Seed default operating hours
INSERT INTO public.operating_hours (day_of_week, open_time, close_time, is_open) VALUES
  (0, '09:00', '18:00', false),
  (1, '09:00', '18:00', true),
  (2, '09:00', '18:00', true),
  (3, '09:00', '18:00', true),
  (4, '09:00', '18:00', true),
  (5, '09:00', '18:00', true),
  (6, '09:00', '14:00', true);

-- Seed default time slots
INSERT INTO public.delivery_time_slots (label, start_time, end_time, display_order) VALUES
  ('Morning', '09:00', '12:00', 0),
  ('Afternoon', '12:00', '15:00', 1),
  ('Evening', '15:00', '18:00', 2);
