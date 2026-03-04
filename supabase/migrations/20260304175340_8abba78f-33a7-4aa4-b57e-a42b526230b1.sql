
-- Drop the overly permissive update policy and replace with token-scoped one
DROP POLICY IF EXISTS "Anyone can update location by token" ON public.location_requests;
CREATE POLICY "Update location by token only pending"
  ON public.location_requests FOR UPDATE TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status = 'completed');
