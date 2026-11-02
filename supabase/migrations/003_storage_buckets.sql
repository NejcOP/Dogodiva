-- ============================================================================
-- DOGODIVA - Storage Buckets Setup
-- ============================================================================
-- Run this in Supabase Dashboard > SQL Editor to create public storage buckets

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('provider-logos', 'provider-logos', true),
  ('provider-covers', 'provider-covers', true),
  ('provider-gallery', 'provider-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Make all buckets public for reading
CREATE POLICY "Public access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Public access to provider-logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-logos');

CREATE POLICY "Public access to provider-covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-covers');

CREATE POLICY "Public access to provider-gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-gallery');

-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow providers to upload their logos
CREATE POLICY "Providers can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'provider-logos');

-- Allow providers to upload covers
CREATE POLICY "Providers can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'provider-covers');

-- Allow providers to upload gallery images
CREATE POLICY "Providers can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'provider-gallery');
