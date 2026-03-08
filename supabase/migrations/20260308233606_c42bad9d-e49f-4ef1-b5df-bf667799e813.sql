ALTER TABLE public.hub_delivery_agents
  ADD COLUMN IF NOT EXISTS email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT NULL;

CREATE POLICY "Anyone can apply as agent"
  ON public.hub_delivery_agents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "Anyone can read pending agents"
  ON public.hub_delivery_agents
  FOR SELECT
  TO anon
  USING (status = 'pending');