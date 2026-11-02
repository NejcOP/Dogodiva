-- ============================================================================
-- DOGODIVA - Complete Database Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES - User profiles connected to Supabase Auth
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'admin')) DEFAULT 'customer',
  city TEXT,
  country TEXT DEFAULT 'Slovenia',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- 2. CATEGORIES - Event and service categories
-- ============================================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

-- ============================================================================
-- 3. PROVIDER_PROFILES - Additional info for service providers
-- ============================================================================
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  vat_number TEXT,
  verification_status TEXT CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'starter', 'professional', 'premium')) DEFAULT 'free',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled')) DEFAULT 'inactive',
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_profiles_slug ON public.provider_profiles(slug);
CREATE INDEX idx_provider_profiles_city ON public.provider_profiles(city);
CREATE INDEX idx_provider_profiles_is_active ON public.provider_profiles(is_active);
CREATE INDEX idx_provider_profiles_is_featured ON public.provider_profiles(is_featured);

-- ============================================================================
-- 4. PROVIDER_SERVICES - Services offered by providers
-- ============================================================================
CREATE TABLE public.provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  price_from DECIMAL(10, 2),
  price_to DECIMAL(10, 2),
  price_type TEXT CHECK (price_type IN ('per_hour', 'per_day', 'per_event', 'per_person')) DEFAULT 'per_event',
  city TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_services_provider_id ON public.provider_services(provider_id);
CREATE INDEX idx_provider_services_category_id ON public.provider_services(category_id);
CREATE INDEX idx_provider_services_is_active ON public.provider_services(is_active);

-- ============================================================================
-- 5. PROVIDER_GALLERY - Images for providers
-- ============================================================================
CREATE TABLE public.provider_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_gallery_provider_id ON public.provider_gallery(provider_id);

-- ============================================================================
-- 6. PROVIDER_AVAILABILITY - Provider calendar
-- ============================================================================
CREATE TABLE public.provider_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT CHECK (status IN ('available', 'booked', 'unavailable')) DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_availability_provider_id ON public.provider_availability(provider_id);
CREATE INDEX idx_provider_availability_date ON public.provider_availability(date);

-- ============================================================================
-- 7. INQUIRIES - Customer inquiries to providers
-- ============================================================================
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.provider_services(id) ON DELETE SET NULL,
  event_type TEXT,
  event_date DATE,
  location TEXT,
  guest_count INTEGER,
  budget DECIMAL(10, 2),
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'contacted', 'accepted', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_customer_id ON public.inquiries(customer_id);
CREATE INDEX idx_inquiries_provider_id ON public.inquiries(provider_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);

-- ============================================================================
-- 8. BOOKINGS - Confirmed bookings
-- ============================================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.provider_services(id) ON DELETE SET NULL,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  event_date DATE,
  event_location TEXT,
  guest_count INTEGER,
  total_price DECIMAL(10, 2),
  platform_commission DECIMAL(10, 2),
  provider_amount DECIMAL(10, 2),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- ============================================================================
-- 9. REVIEWS - Customer reviews
-- ============================================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_reviews_is_verified ON public.reviews(is_verified);

-- ============================================================================
-- 10. FAVORITES - Saved providers
-- ============================================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_provider_id ON public.favorites(provider_id);

-- ============================================================================
-- 11. SUBSCRIPTIONS - Provider subscription plans
-- ============================================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL UNIQUE REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  price DECIMAL(10, 2),
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'annual')) DEFAULT 'monthly',
  status TEXT CHECK (status IN ('active', 'inactive', 'cancelled')) DEFAULT 'inactive',
  current_period_start DATE,
  current_period_end DATE,
  external_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_provider_id ON public.subscriptions(provider_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================================
-- 12. NOTIFICATIONS - User notifications
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================================
-- 13. CONVERSATIONS - Messaging between customers and providers
-- ============================================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX idx_conversations_provider_id ON public.conversations(provider_id);
CREATE INDEX idx_conversations_inquiry_id ON public.conversations(inquiry_id);

-- ============================================================================
-- 14. MESSAGES - Individual messages in conversations
-- ============================================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- ============================================================================
-- 15. CONTACT_MESSAGES - Public contact form submissions
-- ============================================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'read', 'responded')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

-- ============================================================================
-- 16. AI_EVENT_PLANS - Future AI event planning feature
-- ============================================================================
CREATE TABLE public.ai_event_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  guest_count INTEGER,
  budget DECIMAL(10, 2),
  preferences JSONB,
  generated_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_event_plans_user_id ON public.ai_event_plans(user_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-create profile when user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'full_name'), ''),
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update provider average_rating and total_reviews when review is added
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.provider_profiles
  SET
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE provider_id = NEW.provider_id AND is_verified = TRUE),
    average_rating = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE provider_id = NEW.provider_id AND is_verified = TRUE), 0),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created_update_rating
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

CREATE TRIGGER on_review_updated_update_rating
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_provider_profiles_timestamp BEFORE UPDATE ON public.provider_profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_provider_services_timestamp BEFORE UPDATE ON public.provider_services FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_inquiries_timestamp BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_reviews_timestamp BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_subscriptions_timestamp BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_conversations_timestamp BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_ai_event_plans_timestamp BEFORE UPDATE ON public.ai_event_plans FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - ENABLE ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_event_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================

-- Public can view public profile fields
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = OLD.role);

-- ============================================================================
-- RLS POLICIES - CATEGORIES
-- ============================================================================

-- Everyone can read active categories
CREATE POLICY "Active categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (is_active = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ============================================================================
-- RLS POLICIES - PROVIDER_PROFILES
-- ============================================================================

-- Everyone can read active provider profiles
CREATE POLICY "Active provider profiles are viewable by everyone"
  ON public.provider_profiles FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE id = user_id AND role = 'provider'
  ) OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Providers can update their own profile
CREATE POLICY "Providers can update their own profile"
  ON public.provider_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Providers can insert their own profile
CREATE POLICY "Providers can create their own profile"
  ON public.provider_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - PROVIDER_SERVICES
-- ============================================================================

-- Everyone can read active services
CREATE POLICY "Active services are viewable by everyone"
  ON public.provider_services FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT user_id FROM public.provider_profiles WHERE id = provider_id
  ));

-- Providers can manage their own services
CREATE POLICY "Providers can manage their own services"
  ON public.provider_services FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - PROVIDER_GALLERY
-- ============================================================================

-- Everyone can view gallery of active providers
CREATE POLICY "Public gallery of active providers is viewable"
  ON public.provider_gallery FOR SELECT
  USING (provider_id IN (SELECT id FROM public.provider_profiles WHERE is_active = true)
    OR auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- Providers can manage their own gallery
CREATE POLICY "Providers can manage their own gallery"
  ON public.provider_gallery FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - PROVIDER_AVAILABILITY
-- ============================================================================

-- Everyone can read availability
CREATE POLICY "Availability is viewable by everyone"
  ON public.provider_availability FOR SELECT
  USING (true);

-- Providers can manage their own availability
CREATE POLICY "Providers can manage their own availability"
  ON public.provider_availability FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - INQUIRIES
-- ============================================================================

-- Customers can view their own inquiries
CREATE POLICY "Customers can view their own inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = customer_id);

-- Providers can view inquiries sent to them
CREATE POLICY "Providers can view inquiries sent to them"
  ON public.inquiries FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- Customers can create inquiries
CREATE POLICY "Customers can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers and assigned providers can update inquiries
CREATE POLICY "Customers and providers can update inquiries"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id))
  WITH CHECK (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - BOOKINGS
-- ============================================================================

-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- Providers can view bookings for their services
CREATE POLICY "Providers can view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers and assigned providers can update bookings
CREATE POLICY "Customers and providers can update bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id))
  WITH CHECK (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - REVIEWS
-- ============================================================================

-- Everyone can read verified reviews
CREATE POLICY "Public verified reviews are viewable"
  ON public.reviews FOR SELECT
  USING (is_verified = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Customers can view their own unverified reviews
CREATE POLICY "Customers can view their own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = customer_id);

-- Providers can view all reviews for their profiles
CREATE POLICY "Providers can view reviews of their profile"
  ON public.reviews FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- Only customers with verified booking can create reviews
CREATE POLICY "Customers can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid() AND status = 'completed')
  );

-- Customers can update their own reviews
CREATE POLICY "Customers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- ============================================================================
-- RLS POLICIES - FAVORITES
-- ============================================================================

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - SUBSCRIPTIONS
-- ============================================================================

-- Providers can view their own subscriptions
CREATE POLICY "Providers can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Providers can update their own subscriptions
CREATE POLICY "Providers can update their subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================================================

-- Only conversation participants can view
CREATE POLICY "Conversation participants can view conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT customer_id UNION SELECT COALESCE(user_id, NULL) FROM public.provider_profiles WHERE id = provider_id
    )
  );

-- Customers and providers can create conversations
CREATE POLICY "Customers and providers can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.provider_profiles WHERE id = provider_id));

-- ============================================================================
-- RLS POLICIES - MESSAGES
-- ============================================================================

-- Only conversation participants can view messages
CREATE POLICY "Only conversation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE (customer_id = auth.uid() OR provider_id IN (SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()))
    )
  );

-- Conversation participants can insert messages
CREATE POLICY "Conversation participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM public.conversations
      WHERE (customer_id = auth.uid() OR provider_id IN (SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()))
    )
  );

-- ============================================================================
-- RLS POLICIES - CONTACT_MESSAGES
-- ============================================================================

-- Anyone can submit contact form
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Only admins can view contact messages
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ============================================================================
-- RLS POLICIES - AI_EVENT_PLANS
-- ============================================================================

-- Users can view and manage their own plans
CREATE POLICY "Users can view their own AI event plans"
  ON public.ai_event_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI event plans"
  ON public.ai_event_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
