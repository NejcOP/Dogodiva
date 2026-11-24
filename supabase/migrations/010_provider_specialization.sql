-- ============================================================================
-- Add Specialization and Expertise Fields to Provider Applications
-- ============================================================================
-- These fields allow providers to specify what services they offer and their specializations

ALTER TABLE public.provider_applications
  ADD COLUMN specialization TEXT,
  ADD COLUMN expertise_areas TEXT[] DEFAULT '{}';

-- Create an index for faster lookups of expertise areas
CREATE INDEX idx_provider_applications_expertise_areas 
  ON public.provider_applications USING GIN(expertise_areas);

-- Add comments to explain the fields
COMMENT ON COLUMN public.provider_applications.specialization IS 'Main service specialization (e.g., "wedding photography", "portrait photography", "product photography")';
COMMENT ON COLUMN public.provider_applications.expertise_areas IS 'Array of expertise areas or services the provider can offer (e.g., ["weddings", "portraits", "events"])';
