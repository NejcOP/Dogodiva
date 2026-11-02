-- ============================================================================
-- DOGODIVA - Seed Data for Development
-- ============================================================================
-- This migration adds realistic Slovenian seed data for development
-- Note: Provider profiles and demo data require real Supabase Auth users
-- and should be created through the application registration flow

-- ============================================================================
-- CATEGORIES - Initial categories for the marketplace
-- ============================================================================
INSERT INTO public.categories (name, slug, description, icon, is_active) VALUES
('Maturantski plesi', 'maturantski-plesi', 'Prostor in storitve za maturantske plese', '🎓', true),
('Poročne lokacije', 'porocne-lokacije', 'Goreli in sale za poroke', '💍', true),
('Prostori za zabave', 'prostori-za-zabave', 'Prostori za različne vrste zabav', '🎉', true),
('Gostilne in restavracije', 'gostilne-restavracije', 'Restavracije in gostilne za event-e', '🍽️', true),
('Fotografiranje', 'fotografiranje', 'Fotografske storitve za dogodke', '📷', true),
('DJ-ji', 'dj-ji', 'DJ storitve za zabave in dogodke', '🎵', true),
('Glasbeniki in pevci', 'glasbeniki-pevci', 'Glasbeni nastopi in zabava', '🎤', true),
('Glasbene skupine', 'glasbene-skupine', 'Skladbe in live glasbeni nastopi', '🎸', true),
('Organizacija dogodkov', 'organizacija-dogodkov', 'Polna organizacija in upravljanje dogodkov', '📋', true),
('Dekoracija dogodkov', 'dekoracija-dogodkov', 'Dekoracijske storitve in oprema', '🎀', true),
('Catering', 'catering', 'Catering in postrežba za dogodke', '🍴', true),
('Poroke', 'poroke', 'Vse za popolno poroko', '💒', true);

-- ============================================================================
-- Grant public access to read categories
-- ============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT ON public.categories TO anon, authenticated;
