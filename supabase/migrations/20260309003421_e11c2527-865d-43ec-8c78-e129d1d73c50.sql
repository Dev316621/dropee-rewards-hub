-- Add agent_code column to hub_delivery_agents
ALTER TABLE public.hub_delivery_agents 
ADD COLUMN agent_code text UNIQUE;

-- Create function to generate agent code
CREATE OR REPLACE FUNCTION public.generate_agent_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CASE WHEN agent_code ~ '^DROP[0-9]+$' 
    THEN CAST(SUBSTRING(agent_code FROM 5) AS INT)
    ELSE 0 END
  ), 0) + 1 INTO next_num
  FROM public.hub_delivery_agents;
  
  new_code := 'DROP' || next_num;
  RETURN new_code;
END;
$$;

-- Add RLS policy for agents to read active websites
CREATE POLICY "Agents can read active websites"
ON public.hub_websites
FOR SELECT
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.hub_delivery_agents 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);