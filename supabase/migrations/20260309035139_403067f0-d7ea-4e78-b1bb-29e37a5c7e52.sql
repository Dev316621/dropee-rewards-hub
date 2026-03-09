
ALTER TABLE public.hub_delivery_agents 
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone DEFAULT now();

-- Enable realtime for agents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.hub_delivery_agents;
