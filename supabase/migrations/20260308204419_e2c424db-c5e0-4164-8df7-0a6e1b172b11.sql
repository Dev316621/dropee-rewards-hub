
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true);

CREATE POLICY "Admins can upload assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read public assets" ON storage.objects FOR SELECT USING (bucket_id = 'public-assets');
