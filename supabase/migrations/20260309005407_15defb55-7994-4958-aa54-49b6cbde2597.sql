-- Add rating columns to hub_delivery_agents
ALTER TABLE public.hub_delivery_agents 
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings integer DEFAULT 0;

-- Create agent ratings table
CREATE TABLE public.agent_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.hub_delivery_agents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Enable RLS
ALTER TABLE public.agent_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can rate agents"
ON public.agent_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all ratings"
ON public.agent_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can update own ratings"
ON public.agent_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage ratings"
ON public.agent_ratings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to update agent average rating
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.hub_delivery_agents
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.agent_ratings WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)),
    total_ratings = (SELECT COUNT(*) FROM public.agent_ratings WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id))
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to auto-update ratings
CREATE TRIGGER update_agent_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.agent_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_rating();

-- Allow anyone to read active approved agents
CREATE POLICY "Anyone can read active approved agents"
ON public.hub_delivery_agents FOR SELECT
USING (is_active = true AND status = 'approved');