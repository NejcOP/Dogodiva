ALTER TABLE public.provider_applications
  ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN region TEXT,
  ADD COLUMN terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN founding_partner_number SMALLINT;

UPDATE public.provider_applications
SET user_id = submitted_by
WHERE user_id IS NULL
  AND submitted_by IS NOT NULL;

CREATE INDEX provider_applications_user_id_idx
  ON public.provider_applications(user_id, created_at DESC);

CREATE INDEX provider_applications_founding_partner_idx
  ON public.provider_applications(founding_partner_number)
  WHERE founding_partner_number IS NOT NULL;

DROP POLICY IF EXISTS "Users can view their own applications" ON public.provider_applications;
DROP POLICY IF EXISTS "Anyone can submit a provider application" ON public.provider_applications;

CREATE POLICY "Users can view their own applications"
  ON public.provider_applications
  FOR SELECT
  USING (user_id = auth.uid() OR submitted_by = auth.uid());

CREATE POLICY "Authenticated users can submit provider applications"
  ON public.provider_applications
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND COALESCE(user_id, auth.uid()) = auth.uid()
    AND COALESCE(submitted_by, auth.uid()) = auth.uid()
  );

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
  p_terms_accepted BOOLEAN
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
    auth.uid(),
    auth.uid(),
    CURRENT_TIMESTAMP
  )
  RETURNING * INTO inserted_application;

  RETURN inserted_application;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_provider_applications()
RETURNS SETOF public.provider_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Za povezavo prijave je potrebna prijava.';
  END IF;

  SELECT email INTO current_email
  FROM public.profiles
  WHERE id = auth.uid();

  UPDATE public.provider_applications
  SET user_id = auth.uid(),
      submitted_by = auth.uid(),
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id IS NULL
    AND lower(email) = lower(current_email);

  RETURN QUERY
  SELECT *
  FROM public.provider_applications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_provider_application(
  p_application_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS public.provider_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_row public.provider_applications;
  provider_row public.provider_profiles;
  partner_number SMALLINT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Samo administrator lahko potrdi prijavo.';
  END IF;

  SELECT * INTO application_row
  FROM public.provider_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prijava ne obstaja.';
  END IF;

  IF application_row.user_id IS NULL THEN
    RAISE EXCEPTION 'Ponudnik mora najprej povezati uporabniški račun.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('founding-partners', 0));

  SELECT MIN(number_candidate)::SMALLINT
  INTO partner_number
  FROM generate_series(1, 50) AS number_candidate
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.provider_applications
    WHERE founding_partner_number = number_candidate
  );

  IF application_row.status <> 'approved' THEN
    UPDATE public.provider_applications
    SET status = 'approved',
        reviewed_by = auth.uid(),
        review_notes = p_review_notes,
        reviewed_at = CURRENT_TIMESTAMP,
        founding_partner_number = COALESCE(founding_partner_number, partner_number),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = application_row.id
    RETURNING * INTO application_row;
  END IF;

  UPDATE public.profiles
  SET role = 'provider',
      first_name = COALESCE(NULLIF(first_name, ''), split_part(application_row.contact_person, ' ', 1)),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = application_row.user_id;

  INSERT INTO public.provider_profiles (
    user_id,
    business_name,
    slug,
    description,
    email,
    phone,
    website,
    city,
    verification_status,
    subscription_plan,
    subscription_status,
    is_active
  )
  VALUES (
    application_row.user_id,
    application_row.business_name,
    regexp_replace(lower(application_row.business_name), '[^a-z0-9]+', '-', 'g')
      || '-' || substr(application_row.id::text, 1, 8),
    application_row.description,
    application_row.email,
    application_row.phone,
    application_row.website,
    application_row.city,
    'verified',
    'premium',
    'active',
    TRUE
  )
  ON CONFLICT (user_id) DO UPDATE
  SET business_name = EXCLUDED.business_name,
      description = EXCLUDED.description,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      website = EXCLUDED.website,
      city = EXCLUDED.city,
      verification_status = 'verified',
      subscription_plan = 'premium',
      subscription_status = 'active',
      is_active = TRUE,
      updated_at = CURRENT_TIMESTAMP
  RETURNING * INTO provider_row;

  INSERT INTO public.provider_services (
    provider_id,
    category_id,
    title,
    description,
    city
  )
  SELECT
    provider_row.id,
    application_row.category_id,
    application_row.business_name,
    application_row.description,
    application_row.city
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.provider_services
    WHERE provider_id = provider_row.id
      AND category_id = application_row.category_id
  );

  INSERT INTO public.subscriptions (
    provider_id,
    plan_name,
    price,
    billing_interval,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    provider_row.id,
    CASE WHEN application_row.founding_partner_number IS NOT NULL THEN 'founding_partner' ELSE 'professional' END,
    0,
    'monthly',
    'active',
    CURRENT_DATE,
    CASE WHEN application_row.founding_partner_number IS NOT NULL THEN CURRENT_DATE + INTERVAL '6 months' ELSE CURRENT_DATE + INTERVAL '1 month' END
  )
  ON CONFLICT (provider_id) DO UPDATE
  SET plan_name = EXCLUDED.plan_name,
      price = 0,
      status = 'active',
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = CURRENT_TIMESTAMP;

  RETURN application_row;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_provider_application(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_provider_applications() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_provider_application(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_provider_application(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_provider_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_provider_application(UUID, TEXT) TO authenticated;
