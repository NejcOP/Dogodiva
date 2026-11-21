CREATE TABLE public.marketplace_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  location TEXT NOT NULL,
  guest_count INTEGER CHECK (guest_count > 0),
  budget_min NUMERIC(10, 2),
  budget_max NUMERIC(10, 2),
  description TEXT NOT NULL CHECK (char_length(description) >= 20),
  category_ids TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'completed', 'cancelled')),
  accepted_offer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.marketplace_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.marketplace_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) >= 10),
  price NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (request_id, provider_id)
);

ALTER TABLE public.marketplace_requests
  ADD CONSTRAINT marketplace_requests_accepted_offer_fk
  FOREIGN KEY (accepted_offer_id)
  REFERENCES public.marketplace_offers(id)
  ON DELETE SET NULL;

CREATE TABLE public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.marketplace_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (request_id, provider_id, sender_id, created_at)
);

CREATE INDEX marketplace_requests_status_idx ON public.marketplace_requests(status, created_at DESC);
CREATE INDEX marketplace_requests_customer_idx ON public.marketplace_requests(customer_id, created_at DESC);
CREATE INDEX marketplace_offers_request_idx ON public.marketplace_offers(request_id, status);
CREATE INDEX marketplace_offers_provider_idx ON public.marketplace_offers(provider_id, created_at DESC);
CREATE INDEX marketplace_messages_thread_idx ON public.marketplace_messages(request_id, provider_id, created_at);

ALTER TABLE public.marketplace_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers and providers can view marketplace requests"
  ON public.marketplace_requests FOR SELECT
  USING (
    customer_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'provider'
      )
      AND EXISTS (
        SELECT 1 FROM public.provider_profiles
        WHERE user_id = auth.uid() AND is_active = TRUE
      )
    )
  );

CREATE POLICY "Customers manage their marketplace requests"
  ON public.marketplace_requests FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Request participants can view offers"
  ON public.marketplace_offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_requests
      WHERE id = request_id AND customer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id = provider_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can create marketplace offers"
  ON public.marketplace_offers FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND
    EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id = provider_id AND user_id = auth.uid() AND is_active = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM public.marketplace_requests
      WHERE id = request_id AND status = 'open'
    )
  );

CREATE POLICY "Providers can withdraw their marketplace offers"
  ON public.marketplace_offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id = provider_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    status = 'withdrawn'
    AND
    EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id = provider_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Marketplace message participants can read"
  ON public.marketplace_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_requests
      WHERE id = request_id AND customer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id = provider_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Marketplace participants can send messages"
  ON public.marketplace_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.marketplace_requests
        WHERE id = request_id AND customer_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.provider_profiles
        WHERE id = provider_id AND user_id = auth.uid()
      )
    )
  );

CREATE TRIGGER update_marketplace_requests_timestamp
  BEFORE UPDATE ON public.marketplace_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_marketplace_offers_timestamp
  BEFORE UPDATE ON public.marketplace_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE OR REPLACE FUNCTION public.accept_marketplace_offer(p_offer_id UUID)
RETURNS public.marketplace_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_request public.marketplace_requests;
BEGIN
  SELECT requests.*
  INTO selected_request
  FROM public.marketplace_offers offers
  JOIN public.marketplace_requests requests ON requests.id = offers.request_id
  WHERE offers.id = p_offer_id
    AND requests.customer_id = auth.uid()
    AND requests.status = 'open'
    AND offers.status = 'pending'
  FOR UPDATE OF requests, offers;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ponudbe ni mogoče sprejeti.';
  END IF;

  UPDATE public.marketplace_offers
  SET status = 'rejected'
  WHERE request_id = selected_request.id
    AND id <> p_offer_id
    AND status = 'pending';

  UPDATE public.marketplace_offers
  SET status = 'accepted'
  WHERE id = p_offer_id;

  UPDATE public.marketplace_requests
  SET status = 'closed', accepted_offer_id = p_offer_id
  WHERE id = selected_request.id
  RETURNING * INTO selected_request;

  RETURN selected_request;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_marketplace_offer(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_marketplace_offer(UUID) TO authenticated;
