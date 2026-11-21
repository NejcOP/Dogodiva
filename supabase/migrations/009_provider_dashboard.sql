ALTER TABLE public.provider_profiles
  ADD COLUMN main_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN service_areas TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN detailed_description TEXT,
  ADD COLUMN instagram TEXT,
  ADD COLUMN facebook TEXT,
  ADD COLUMN starting_price NUMERIC(10, 2);

UPDATE public.provider_profiles providers
SET main_category_id = (
  SELECT category_id
  FROM public.provider_services services
  WHERE services.provider_id = providers.id
    AND services.is_active = TRUE
  ORDER BY services.created_at
  LIMIT 1
)
WHERE main_category_id IS NULL;

CREATE TABLE public.provider_unavailable_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  unavailable_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider_id, unavailable_date)
);

CREATE INDEX provider_unavailable_dates_provider_idx
  ON public.provider_unavailable_dates(provider_id, unavailable_date);

ALTER TABLE public.provider_unavailable_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Unavailable dates are viewable by everyone"
  ON public.provider_unavailable_dates FOR SELECT
  USING (TRUE);

CREATE POLICY "Providers manage their unavailable dates"
  ON public.provider_unavailable_dates FOR ALL
  USING (
    provider_id IN (
      SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Providers can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Providers can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Providers can upload gallery images" ON storage.objects;

CREATE POLICY "Providers can upload their logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-logos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete their logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-logos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can upload their covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-covers'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete their covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-covers'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-gallery'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete their gallery images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-gallery'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.provider_profiles WHERE user_id = auth.uid()
    )
  );
