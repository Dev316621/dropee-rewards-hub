CREATE POLICY "Agents can update own online status"
ON public.hub_delivery_agents
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());