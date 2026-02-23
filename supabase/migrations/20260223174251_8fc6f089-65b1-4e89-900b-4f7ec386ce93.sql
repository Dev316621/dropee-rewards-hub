
-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  date_of_birth DATE,
  referral_code TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Tiers table
CREATE TABLE public.tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_deliveries INT NOT NULL DEFAULT 0,
  max_deliveries INT,
  perks JSONB DEFAULT '[]'::jsonb,
  badge_icon TEXT DEFAULT 'bronze',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tiers" ON public.tiers FOR SELECT USING (true);
CREATE POLICY "Admins can manage tiers" ON public.tiers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Deliveries table
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pickup TEXT NOT NULL,
  dropoff TEXT NOT NULL,
  weight NUMERIC(6,2) DEFAULT 0,
  fee NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  points_earned INT DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own deliveries" ON public.deliveries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all deliveries" ON public.deliveries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Loyalty points log
CREATE TABLE public.loyalty_points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  source TEXT NOT NULL,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE SET NULL,
  spin_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_points_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own points log" ON public.loyalty_points_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage points log" ON public.loyalty_points_log FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Free delivery credits
CREATE TABLE public.free_delivery_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_credits INT NOT NULL DEFAULT 0,
  used_credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.free_delivery_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own credits" ON public.free_delivery_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage credits" ON public.free_delivery_credits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own or public coupons" ON public.coupons FOR SELECT TO authenticated
  USING (is_public = true OR assigned_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Coupon redemptions
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own redemptions" ON public.coupon_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON public.coupon_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage redemptions" ON public.coupon_redemptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Spin config
CREATE TABLE public.spin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spin_type TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  max_spins INT DEFAULT 1,
  reset_rule TEXT DEFAULT 'midnight',
  reset_day_of_week INT DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spin_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read spin config" ON public.spin_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage spin config" ON public.spin_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Spin slots
CREATE TABLE public.spin_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  prize_type TEXT NOT NULL DEFAULT 'no_prize',
  prize_value TEXT DEFAULT '',
  probability_weight INT NOT NULL DEFAULT 1,
  color TEXT DEFAULT '#FF6B35',
  icon TEXT DEFAULT '🎁',
  coupon_expiry_days INT DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  spin_type TEXT NOT NULL DEFAULT 'daily',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spin_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active spin slots" ON public.spin_slots FOR SELECT USING (true);
CREATE POLICY "Admins can manage spin slots" ON public.spin_slots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Spin results
CREATE TABLE public.spin_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spin_type TEXT NOT NULL,
  slot_id UUID REFERENCES public.spin_slots(id) ON DELETE SET NULL,
  prize_type TEXT NOT NULL,
  prize_value TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own spin results" ON public.spin_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage spin results" ON public.spin_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 12. Partners
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT DEFAULT '',
  link TEXT DEFAULT '',
  discount_code TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'general',
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  image_url TEXT,
  video_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 14. Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  is_weekly_highlight BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active offers" ON public.offers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage offers" ON public.offers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 15. Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🏆',
  condition_type TEXT NOT NULL,
  condition_value INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 16. User badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage user badges" ON public.user_badges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 17. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 18. Loyalty settings (key/value config)
CREATE TABLE public.loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.loyalty_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.loyalty_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 19. Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bonus_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can manage referrals" ON public.referrals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 20. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_spin_config_updated_at BEFORE UPDATE ON public.spin_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_settings_updated_at BEFORE UPDATE ON public.loyalty_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 21. Generate referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'DROPEE-' || upper(substr(md5(random()::text), 1, 6));
  RETURN code;
END;
$$;

-- 22. Auto-create profile + assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    public.generate_referral_code()
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.free_delivery_credits (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 23. Auto-credit points on delivery completion
CREATE OR REPLACE FUNCTION public.handle_delivery_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_points INT := 2;
  multiplier NUMERIC := 1;
  double_enabled TEXT;
  double_start TEXT;
  double_end TEXT;
  double_mult TEXT;
  total_points INT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Check for double points
    SELECT value INTO double_enabled FROM public.loyalty_settings WHERE key = 'double_points_enabled';
    IF double_enabled = 'true' THEN
      SELECT value INTO double_start FROM public.loyalty_settings WHERE key = 'double_points_start';
      SELECT value INTO double_end FROM public.loyalty_settings WHERE key = 'double_points_end';
      SELECT value INTO double_mult FROM public.loyalty_settings WHERE key = 'double_points_multiplier';
      IF double_start IS NOT NULL AND double_end IS NOT NULL
         AND now() >= double_start::timestamptz AND now() <= double_end::timestamptz THEN
        multiplier := COALESCE(double_mult::numeric, 2);
      END IF;
    END IF;

    total_points := (base_points * multiplier)::int;
    
    UPDATE public.deliveries SET points_earned = total_points WHERE id = NEW.id;
    
    INSERT INTO public.loyalty_points_log (user_id, amount, source, delivery_id, note)
    VALUES (NEW.user_id, total_points, 'delivery', NEW.id, 'Delivery #' || substr(NEW.id::text, 1, 8) || ' completed');

    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (NEW.user_id, 'delivery_complete', 'Delivery Complete! 🎉', 'You earned +' || total_points || ' loyalty points!');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_delivery_status_change
  AFTER UPDATE OF status ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.handle_delivery_complete();

-- Also trigger on insert with status = completed
CREATE TRIGGER on_delivery_insert_complete
  AFTER INSERT ON public.deliveries
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.handle_delivery_complete();

-- 24. Seed default tier data
INSERT INTO public.tiers (name, min_deliveries, max_deliveries, perks, badge_icon, display_order) VALUES
  ('Starter', 0, 9, '["Basic loyalty points", "Weekly Dropee Offers"]', 'bronze', 1),
  ('Regular', 10, 24, '["All Starter perks", "5% priority queue", "1 exclusive coupon/month"]', 'silver', 2),
  ('Elite', 25, 49, '["All Regular perks", "Priority handling", "Exclusive promo access", "Birthday free delivery"]', 'gold', 3),
  ('DROPEE Prime', 50, NULL, '["All Elite perks", "Top priority (PRIME)", "Partner discounts", "Early access", "Special badge", "Profile frame"]', 'diamond', 4);

-- 25. Seed default spin config
INSERT INTO public.spin_config (spin_type, enabled, max_spins, reset_rule) VALUES
  ('daily', true, 1, 'midnight'),
  ('weekly', true, 1, 'monday');

-- 26. Seed default loyalty settings
INSERT INTO public.loyalty_settings (key, value) VALUES
  ('welcome_bonus', '5'),
  ('referral_bonus_referrer', '5'),
  ('referral_bonus_referred', '3'),
  ('mystery_box_threshold', '15'),
  ('double_points_enabled', 'false'),
  ('double_points_multiplier', '2'),
  ('double_points_start', ''),
  ('double_points_end', ''),
  ('event_name', '');

-- 27. Helper function: get user points balance
CREATE OR REPLACE FUNCTION public.get_user_points_balance(_user_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::int FROM public.loyalty_points_log WHERE user_id = _user_id
$$;

-- 28. Helper: get user delivery count
CREATE OR REPLACE FUNCTION public.get_user_delivery_count(_user_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.deliveries WHERE user_id = _user_id AND status = 'completed'
$$;

-- 29. Helper: get user current tier
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id UUID)
RETURNS TABLE(tier_name TEXT, tier_badge TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.name, t.badge_icon
  FROM public.tiers t
  WHERE (SELECT COUNT(*)::int FROM public.deliveries WHERE user_id = _user_id AND status = 'completed')
    BETWEEN t.min_deliveries AND COALESCE(t.max_deliveries, 999999)
  ORDER BY t.display_order DESC
  LIMIT 1
$$;
