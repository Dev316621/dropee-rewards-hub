
-- Function to process referral after new user signup
-- Looks up the referral code from user metadata, finds the referrer, creates referral record, awards bonus points
CREATE OR REPLACE FUNCTION public.handle_referral_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  bonus_points INT := 10;
BEGIN
  -- Get referral_source from user metadata
  ref_code := NEW.raw_user_meta_data->>'referral_source';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Find the referrer by referral_code
    SELECT user_id INTO referrer_user_id
    FROM public.profiles
    WHERE referral_code = ref_code
    LIMIT 1;
    
    IF referrer_user_id IS NOT NULL AND referrer_user_id != NEW.id THEN
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_id, bonus_awarded)
      VALUES (referrer_user_id, NEW.id, true);
      
      -- Award bonus points to referrer
      INSERT INTO public.loyalty_points_log (user_id, amount, source, note)
      VALUES (referrer_user_id, bonus_points, 'referral', 'Referral bonus — new user signed up with your code');
      
      -- Award bonus points to referred user
      INSERT INTO public.loyalty_points_log (user_id, amount, source, note)
      VALUES (NEW.id, bonus_points, 'referral', 'Welcome bonus — signed up with referral code');
      
      -- Notify referrer
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (referrer_user_id, 'referral', 'New Referral! 🎉', 'Someone signed up with your referral code. You both earned ' || bonus_points || ' bonus points!');
      
      -- Notify referred user
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (NEW.id, 'referral', 'Welcome Bonus! 🎁', 'You earned ' || bonus_points || ' bonus points for using a referral code!');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (fires after handle_new_user so profile exists)
CREATE TRIGGER on_referral_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_on_signup();

-- Add RLS policy for users to insert referrals (needed for the trigger's SECURITY DEFINER)
-- Already have admin ALL and user SELECT on referrals, which is sufficient
