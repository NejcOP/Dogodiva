-- ============================================================================
-- Provider Applications Table
-- ============================================================================
-- Stores initial provider application forms submitted via "Za ponudnike" page
-- These are separate from provider_profiles - a provider account must be approved first

CREATE TABLE public.provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  city TEXT NOT NULL,
  website TEXT,
  description TEXT,
  
  -- Application workflow
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_provider_applications_status ON public.provider_applications(status);
CREATE INDEX idx_provider_applications_category_id ON public.provider_applications(category_id);
CREATE INDEX idx_provider_applications_email ON public.provider_applications(email);
CREATE INDEX idx_provider_applications_submitted_by ON public.provider_applications(submitted_by);
CREATE INDEX idx_provider_applications_created_at ON public.provider_applications(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

-- Public read: Applications can be viewed by submitted_by user (only their own)
CREATE POLICY "Users can view their own applications"
  ON public.provider_applications
  FOR SELECT
  USING (submitted_by = auth.uid());

-- Public insert: Anyone can submit an application
CREATE POLICY "Anyone can submit a provider application"
  ON public.provider_applications
  FOR INSERT
  WITH CHECK (true);

-- Admin update: Only admins can review/approve applications
CREATE POLICY "Admins can update applications"
  ON public.provider_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.provider_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
