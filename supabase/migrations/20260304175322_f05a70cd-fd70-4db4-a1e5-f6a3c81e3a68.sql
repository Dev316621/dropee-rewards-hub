
-- Add address and profile_completed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Add recipient_name, description, receipt to deliveries
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS recipient_name text DEFAULT '';
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS receipt text DEFAULT '';

-- Create location_requests table
CREATE TABLE IF NOT EXISTS public.location_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid REFERENCES public.deliveries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  token text UNIQUE NOT NULL,
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.location_requests ENABLE ROW LEVEL SECURITY;

-- RLS: admin can manage all
CREATE POLICY "Admins can manage location requests"
  ON public.location_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: anyone can update with token (for the public share page)
CREATE POLICY "Anyone can update location by token"
  ON public.location_requests FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (status = 'pending');

-- RLS: anyone can read by token (for the public share page)
CREATE POLICY "Anyone can read location by token"
  ON public.location_requests FOR SELECT TO anon, authenticated
  USING (true);

-- Update handle_new_user to include address, profile_completed, phone, date_of_birth
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, date_of_birth, address, referral_code, profile_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data->>'date_of_birth' != '' 
         THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
         ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    public.generate_referral_code(),
    CASE WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL AND NEW.raw_user_meta_data->>'full_name' != '' 
         AND NEW.raw_user_meta_data->>'phone' IS NOT NULL AND NEW.raw_user_meta_data->>'phone' != ''
         THEN true ELSE false END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.free_delivery_credits (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$function$;
