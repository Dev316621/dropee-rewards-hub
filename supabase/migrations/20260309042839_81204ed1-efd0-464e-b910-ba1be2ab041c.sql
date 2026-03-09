
CREATE OR REPLACE FUNCTION public.handle_region_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify on approval
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'region_approved',
      'Region Request Approved! 🎉',
      'Your delivery region request for "' || NEW.region_name || '" has been approved by an admin.'
    );
  END IF;

  -- Notify on rejection
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'region_rejected',
      'Region Request Declined',
      'Your delivery region request for "' || NEW.region_name || '" was declined.' ||
      CASE WHEN COALESCE(NEW.admin_notes, '') != '' THEN ' Reason: ' || NEW.admin_notes ELSE '' END
    );
  END IF;

  RETURN NEW;
END;
$$;
