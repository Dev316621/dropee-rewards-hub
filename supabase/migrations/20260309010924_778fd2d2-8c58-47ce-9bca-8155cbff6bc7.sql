-- Add latitude and longitude columns to profiles for admin location pinning
ALTER TABLE public.profiles 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;