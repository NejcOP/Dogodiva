ALTER TABLE public.provider_profiles
  ADD COLUMN region TEXT;

ALTER TABLE public.provider_profiles
  DROP CONSTRAINT IF EXISTS provider_profiles_subscription_plan_check;

UPDATE public.provider_profiles
SET subscription_plan = CASE subscription_plan
  WHEN 'free' THEN 'basic'
  WHEN 'starter' THEN 'basic'
  WHEN 'professional' THEN 'premium'
  WHEN 'premium' THEN 'business'
  ELSE 'basic'
END;

ALTER TABLE public.provider_profiles
  ADD CONSTRAINT provider_profiles_subscription_plan_check
  CHECK (subscription_plan IN ('basic', 'premium', 'business'));

CREATE POLICY "Admins can manage provider profiles"
  ON public.provider_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION public.unique_provider_slug(p_business_name TEXT, p_application_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  suffix INTEGER := 2;
BEGIN
  base_slug := trim(both '-' FROM regexp_replace(
    lower(
      translate(
        p_business_name,
        'ČĆŠŽĐčćšžđ',
        'CCSZDccszd'
      )
    ),
    '[^a-z0-9]+',
    '-',
    'g'
  ));

  IF base_slug = '' THEN
    base_slug := 'ponudnik';
  END IF;

  candidate := base_slug;
  WHILE EXISTS (
    SELECT 1 FROM public.provider_profiles
    WHERE slug = candidate
  ) LOOP
    candidate := base_slug || '-' || suffix;
    suffix := suffix + 1;
  END LOOP;

  IF candidate = '' THEN
    RETURN base_slug || '-' || substr(p_application_id::text, 1, 8);
  END IF;
  RETURN candidate;
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
  provider_user_id UUID;
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

  provider_user_id := application_row.user_id;
  IF provider_user_id IS NULL THEN
    SELECT id INTO provider_user_id
    FROM public.profiles
    WHERE lower(email) = lower(application_row.email)
    LIMIT 1;
  END IF;

  IF provider_user_id IS NULL THEN
    RAISE EXCEPTION 'Ponudnik mora najprej ustvariti uporabniški račun z e-naslovom prijave.';
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

  UPDATE public.profiles
  SET role = 'provider',
      first_name = COALESCE(NULLIF(first_name, ''), split_part(application_row.contact_person, ' ', 1)),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = provider_user_id;

  SELECT * INTO provider_row
  FROM public.provider_profiles
  WHERE user_id = provider_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.provider_profiles (
      user_id,
      business_name,
      slug,
      description,
      email,
      phone,
      website,
      city,
      region,
      verification_status,
      subscription_plan,
      subscription_status,
      is_active
    )
    VALUES (
      provider_user_id,
      application_row.business_name,
      public.unique_provider_slug(application_row.business_name, application_row.id),
      application_row.description,
      application_row.email,
      application_row.phone,
      application_row.website,
      application_row.city,
      application_row.region,
      'verified',
      'business',
      'active',
      TRUE
    )
    RETURNING * INTO provider_row;
  ELSE
    UPDATE public.provider_profiles
    SET business_name = application_row.business_name,
        description = application_row.description,
        email = application_row.email,
        phone = application_row.phone,
        website = application_row.website,
        city = application_row.city,
        region = application_row.region,
        verification_status = 'verified',
        subscription_plan = 'business',
        subscription_status = 'active',
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = provider_row.id
    RETURNING * INTO provider_row;
  END IF;

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
    'business',
    0,
    'monthly',
    'active',
    CURRENT_DATE,
    CASE WHEN partner_number IS NOT NULL THEN CURRENT_DATE + INTERVAL '6 months' ELSE NULL END
  )
  ON CONFLICT (provider_id) DO UPDATE
  SET plan_name = 'business',
      price = 0,
      status = 'active',
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = CURRENT_TIMESTAMP;

  UPDATE public.provider_applications
  SET user_id = provider_user_id,
      submitted_by = provider_user_id,
      status = 'approved',
      reviewed_by = auth.uid(),
      review_notes = p_review_notes,
      reviewed_at = CURRENT_TIMESTAMP,
      founding_partner_number = COALESCE(founding_partner_number, partner_number),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = application_row.id
  RETURNING * INTO application_row;

  RETURN application_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_provider_application(
  p_application_id UUID,
  p_review_notes TEXT
)
RETURNS public.provider_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_row public.provider_applications;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Samo administrator lahko zavrne prijavo.';
  END IF;

  IF char_length(trim(p_review_notes)) < 3 THEN
    RAISE EXCEPTION 'Vnesite razlog zavrnitve.';
  END IF;

  UPDATE public.provider_applications
  SET status = 'rejected',
      reviewed_by = auth.uid(),
      review_notes = trim(p_review_notes),
      reviewed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_application_id
  RETURNING * INTO application_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prijava ne obstaja.';
  END IF;
  RETURN application_row;
END;
$$;

REVOKE ALL ON FUNCTION public.unique_provider_slug(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_provider_application(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_provider_application(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_provider_application(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_provider_application(UUID, TEXT) TO authenticated;
