-- ============================================================================
-- Update submit_provider_application function to accept specialization fields
-- ============================================================================

CREATE OR REPLACE FUNCTION public.submit_provider_application(
  p_business_name TEXT,
  p_contact_person TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_category_id UUID,
  p_city TEXT,
  p_region TEXT,
  p_website TEXT,
  p_description TEXT,
  p_specialization TEXT DEFAULT NULL,
  p_expertise_areas TEXT[] DEFAULT '{}',
  p_terms_accepted BOOLEAN DEFAULT FALSE
)
RETURNS public.provider_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT := lower(trim(p_email));
  inserted_application public.provider_applications;
BEGIN
  IF NOT p_terms_accepted THEN
    RAISE EXCEPTION 'Za oddajo prijave sprejmite pogoje za ponudnike.';
  END IF;

  IF char_length(trim(p_business_name)) < 2
    OR char_length(trim(p_contact_person)) < 2
    OR normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    OR char_length(trim(p_phone)) < 6
    OR char_length(trim(p_city)) < 2
    OR char_length(trim(p_region)) < 2
    OR char_length(trim(p_description)) < 20 THEN
    RAISE EXCEPTION 'Prosimo, izpolnite vsa obvezna polja.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.categories
    WHERE id = p_category_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Izbrana kategorija ni na voljo.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(normalized_email, 0));

  IF EXISTS (
    SELECT 1
    FROM public.provider_applications
    WHERE (
      lower(email) = normalized_email
      OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR submitted_by = auth.uid()))
    )
    AND status IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'Za ta račun ali e-naslov že obstaja aktivna prijava.';
  END IF;

  INSERT INTO public.provider_applications (
    business_name,
    contact_person,
    email,
    phone,
    category_id,
    city,
    region,
    website,
    description,
    specialization,
    expertise_areas,
    user_id,
    submitted_by,
    terms_accepted_at
  )
  VALUES (
    trim(p_business_name),
    trim(p_contact_person),
    normalized_email,
    trim(p_phone),
    p_category_id,
    trim(p_city),
    trim(p_region),
    NULLIF(trim(p_website), ''),
    trim(p_description),
    NULLIF(trim(p_specialization), ''),
    COALESCE(p_expertise_areas, '{}'),
    auth.uid(),
    auth.uid(),
    CURRENT_TIMESTAMP
  )
  RETURNING * INTO inserted_application;

  RETURN inserted_application;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_provider_application(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_provider_application(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], BOOLEAN) TO anon, authenticated;
