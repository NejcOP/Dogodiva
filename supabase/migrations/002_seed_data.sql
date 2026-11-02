-- ============================================================================
-- DOGODIVA - Seed Data for Development
-- ============================================================================
-- This migration adds realistic Slovenian seed data for development

-- ============================================================================
-- CATEGORIES - Initial categories for the marketplace
-- ============================================================================
INSERT INTO public.categories (name, slug, description, icon, is_active) VALUES
('Maturantski plesi', 'maturantski-plesi', 'Prostor in storitve za maturantske plese', '🎓', true),
('Poročne lokacije', 'porocne-lokacije', 'Goreli in sale za poroke', '💍', true),
('Prostori za zabave', 'prostori-za-zabave', 'Prostori za različne vrste zabav', '🎉', true),
('Gostilne in restavracije', 'gostilne-restavracije', 'Restavracije in gostilne za event-e', '🍽️', true),
('Fotografiranje', 'fotografiranje', 'Fotografske storitve za događaje', '📷', true),
('DJ-ji', 'dj-ji', 'DJ storitve za zabave in dogodke', '🎵', true),
('Glasbeniki in pevci', 'glasbeniki-pevci', 'Glasbeni nastopi in zabava', '🎤', true),
('Glasbene skupine', 'glasbene-skupine', 'Skladbe in live glasbeni nastopi', '🎸', true),
('Organizacija dogodkov', 'organizacija-dogodkov', 'Polna organizacija in upravljanje dogodkov', '📋', true),
('Dekoracija dogodkov', 'dekoracija-dogodkov', 'Dekoracijske storitve in oprema', '🎀', true),
('Catering', 'catering', 'Catering in postrežba za dogodke', '🍴', true),
('Poroke', 'poroke', 'Vse za popolno poroko', '💒', true);

-- ============================================================================
-- DEMO PROVIDER PROFILES
-- ============================================================================
-- Note: These are demo providers. In production, real business verification required.

-- Insert profiles for providers (creates auth references)
-- Provider 1: Ljubljana Halls - Wedding & Event Venue
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Ljubljana Halls',
  'ljubljana-halls',
  'Najprestižnejša poročna in event lokacija v Ljubljani. Kapaciteta do 500 oseb. Vključeni so: catering, dekoracija, zvočna tehnika in parking.',
  'https://images.unsplash.com/photo-1519671482677-f32ba5ee53e8?w=200',
  'https://images.unsplash.com/photo-1519671482677-f32ba5ee53e8?w=1200',
  'info@ljublja-halls.si', '+386 1 234 5678', 'https://ljubljanahalls.si',
  'Ljubljana', 'Gosposka 5', '1000',
  'verified', 'professional', 'active', true, true
);

-- Provider 2: Fotograf Marko - Professional Photography
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Marko Photography',
  'marko-photography',
  'Profesionalna fotografija porok, maturantskih plesov in drugih dogodkov. 15+ let izkušenj. Dostopno po celotni Sloveniji.',
  'https://images.unsplash.com/photo-1502882917128-1aa500764cbd?w=200',
  'https://images.unsplash.com/photo-1502882917128-1aa500764cbd?w=1200',
  'marko@fotografija.si', '+386 30 123 456', 'https://marko-fotografija.si',
  'Ljubljana', 'Prešernova 15', '1000',
  'verified', 'professional', 'active', true, true
);

-- Provider 3: DJ Šta Pa - DJ Services
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,
  'DJ Šta Pa',
  'dj-sta-pa',
  'Profesionalni DJ za vse vrste dogodkov. Moderna oprema, odličan repertoar od klasike do najnovijih hitov. Pokrivamo vso Slovenijo.',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
  'kontakt@djstapa.si', '+386 31 234 567', 'https://djstapa.si',
  'Kranj', 'Tavčarjeva 8', '4000',
  'verified', 'professional', 'active', true, true
);

-- Provider 4: Krčma Gostilna - Restaurant & Catering
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000004'::uuid,
  'Krčma Gostilna',
  'krcma-gostilna',
  'Tradicionalna gostilna z modernim pristopom. Specialnost naša je catering za dogodke - od manjših srečanj do velikih gostij. Domača hrana, domači vini.',
  'https://images.unsplash.com/photo-1504674900947-ab400cda5fc6?w=200',
  'https://images.unsplash.com/photo-1504674900947-ab400cda5fc6?w=1200',
  'rezervacija@krcma-gostilna.si', '+386 1 234 9876', 'https://krcma-gostilna.si',
  'Ljubljana', 'Emonska 14', '1000',
  'verified', 'starter', 'active', false, true
);

-- Provider 5: Dekoracije Pro - Event Decoration
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000005'::uuid,
  'Dekoracije Pro',
  'dekoracije-pro',
  'Kompletna dekoracija догов-ков - od oblikovanja do postavitve. Cvetje, baloni, tekstili, rasveta. Prilagodljivo vsakemu slogu in budžetu.',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
  'info@dekoracije-pro.si', '+386 40 123 456', 'https://dekoracije-pro.si',
  'Maribor', 'Mladinska 22', '2000',
  'verified', 'professional', 'active', true, true
);

-- Provider 6: Event Management - Event Organization
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000006'::uuid,
  'Event Management Slovenija',
  'event-management-slovenija',
  'Celovit odgovor za organizacijo vsakega dogodka. Od načrtovanja do izvedbe - skrbi se za vse.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  'info@event-management.si', '+386 1 700 0000', 'https://event-management.si',
  'Ljubljana', 'Slovenska cesta 50', '1000',
  'verified', 'premium', 'active', true, true
);

-- Provider 7: Bend Veseli Glasbeniki - Live Band
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000007'::uuid,
  'Veseli Glasbeniki',
  'veseli-glasbeniki',
  'Tradicionalna slovenska harmonika zasedba. Nastopimo na porokah, maturantskih plesih in ostalih slavnostih. Bogata repertoarjerica od klasike do modernih aranžmajev.',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
  'info@veseli-glasbeniki.si', '+386 51 123 456', 'https://veseli-glasbeniki.si',
  'Novo Mesto', 'Dolniška 30', '8000',
  'verified', 'starter', 'active', false, true
);

-- Provider 8: Bled Event Hall - Premium Venue
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000008'::uuid,
  'Bled Event Hall',
  'bled-event-hall',
  'Elegantna poročna lokacija s pogledom na Blejsko jezero. Kapaciteta do 300 oseb. Vključeni: park, parking, garderobi.',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1200',
  'info@bled-event-hall.si', '+386 4 576 8910', 'https://bled-event-hall.si',
  'Bled', 'Stara blejska cesta 1', '4260',
  'verified', 'professional', 'active', true, true
);

-- Provider 9: Pevka Sara - Singer
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Sara - Profesionalna pevka',
  'sara-pevka',
  'Karaoke in live glasba za vaš dogodek. Nastopujem z raznovrstnim repertoarjem - od klasike do najnovijih hitov.',
  'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=200',
  'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1200',
  'sara@pevka.si', '+386 40 987 654', null,
  'Ljubljana', null, '1000',
  'pending', 'free', 'inactive', false, true
);

-- Provider 10: Celje Catering - Catering Service
INSERT INTO public.provider_profiles (
  user_id, business_name, slug, description, logo_url, cover_image_url,
  email, phone, website, city, address, postal_code, verification_status,
  subscription_plan, subscription_status, is_featured, is_active
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  'Celje Catering',
  'celje-catering',
  'Odličen catering za dogodke v Celju in okolici. Izbira menijev po željah, vegetarijanske opcije, dietetska hrana.',
  'https://images.unsplash.com/photo-1555939594-58d7cb561518?w=200',
  'https://images.unsplash.com/photo-1555939594-58d7cb561518?w=1200',
  'info@celje-catering.si', '+386 3 423 1234', 'https://celje-catering.si',
  'Celje', 'Glavna 45', '3000',
  'verified', 'starter', 'active', false, true
);

-- ============================================================================
-- PROVIDER SERVICES - Services offered by each provider
-- ============================================================================

-- Ljubljana Halls Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'ljubljana-halls'),
  (SELECT id FROM public.categories WHERE slug = 'porocne-lokacije'),
  'Poročna lokacija za do 200 oseb',
  'Elegantna sala s parketom in ambientalnim svetlobnim sistemom',
  1500.00, 3000.00, 'per_event', 'Ljubljana', true
);

INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'ljubljana-halls'),
  (SELECT id FROM public.categories WHERE slug = 'maturantski-plesi'),
  'Maturantski ples - najem sale',
  'Najemi le odličko prostor za vaš plesni večer',
  800.00, 1500.00, 'per_event', 'Ljubljana', true
);

-- Marko Photography Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'marko-photography'),
  (SELECT id FROM public.categories WHERE slug = 'fotografiranje'),
  'Poročna fotografija - poldan',
  'Pokritje poroke od priprav do tanca do polnoči',
  800.00, 1200.00, 'per_event', 'Ljubljana', true
);

INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'marko-photography'),
  (SELECT id FROM public.categories WHERE slug = 'fotografiranje'),
  'Maturantski ples fotografija',
  'Fotografija vašega posebnega večera',
  300.00, 500.00, 'per_event', 'Ljubljana', true
);

-- DJ Šta Pa Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'dj-sta-pa'),
  (SELECT id FROM public.categories WHERE slug = 'dj-ji'),
  'DJ za poroko - 6 ur',
  'DJ pokritje z najboljšo opremo in 25+ let izkušenj',
  600.00, 900.00, 'per_event', 'Kranj', true
);

INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'dj-sta-pa'),
  (SELECT id FROM public.categories WHERE slug = 'dj-ji'),
  'DJ za maturantski ples',
  'Vrhunski zvok in luči za vašo zabavo',
  400.00, 600.00, 'per_event', 'Kranj', true
);

-- Krčma Gostilna Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'krcma-gostilna'),
  (SELECT id FROM public.categories WHERE slug = 'catering'),
  'Catering - tri hodi',
  'Tradicionalna slovenska hrana, domača vina in postrežba',
  25.00, 40.00, 'per_person', 'Ljubljana', true
);

INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'krcma-gostilna'),
  (SELECT id FROM public.categories WHERE slug = 'gostilne-restavracije'),
  'Najem gostilne za privatne dogodke',
  'Prostor za do 80 oseb',
  500.00, 800.00, 'per_event', 'Ljubljana', true
);

-- Dekoracije Pro Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'dekoracije-pro'),
  (SELECT id FROM public.categories WHERE slug = 'dekoracija-dogodkov'),
  'Celovita dekoracija poroke',
  'Cvetje, baloni, tekstili, pogrinjki - vse po vaših željah',
  800.00, 2000.00, 'per_event', 'Maribor', true
);

-- Event Management Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'event-management-slovenija'),
  (SELECT id FROM public.categories WHERE slug = 'organizacija-dogodkov'),
  'Celovita organizacija poroke',
  'Popolna skrb za vaš posebni dan - od ideje do izvedbe',
  3000.00, 10000.00, 'per_event', 'Ljubljana', true
);

-- Veseli Glasbeniki Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'veseli-glasbeniki'),
  (SELECT id FROM public.categories WHERE slug = 'glasbene-skupine'),
  'Harmonika zasedba - 3 ure',
  'Tradicionalna glasba za vaš dogodek',
  500.00, 800.00, 'per_event', 'Novo Mesto', true
);

-- Bled Event Hall Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'bled-event-hall'),
  (SELECT id FROM public.categories WHERE slug = 'porocne-lokacije'),
  'Poročna lokacija - Bled',
  'Najlepša lokacija pri Blejskem jezeru, vključen parking in ogled vrnite',
  2000.00, 3500.00, 'per_event', 'Bled', true
);

-- Sara - Pevka Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'sara-pevka'),
  (SELECT id FROM public.categories WHERE slug = 'glasbeniki-pevci'),
  'Karaoke in live nastop',
  'Zabava za vaš dogodek',
  200.00, 400.00, 'per_event', 'Ljubljana', true
);

-- Celje Catering Services
INSERT INTO public.provider_services (provider_id, category_id, title, description, price_from, price_to, price_type, city, is_active) 
VALUES (
  (SELECT id FROM public.provider_profiles WHERE slug = 'celje-catering'),
  (SELECT id FROM public.categories WHERE slug = 'catering'),
  'Catering - standard meni',
  'Odlična jedla in postrežba',
  20.00, 35.00, 'per_person', 'Celje', true
);

-- ============================================================================
-- PROVIDER GALLERY - Sample images for providers
-- ============================================================================

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'ljubljana-halls'), 'https://images.unsplash.com/photo-1519671482677-f32ba5ee53e8?w=800', 'Glavna sala', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'ljubljana-halls'), 'https://images.unsplash.com/photo-1519671482677-f32ba5ee53e8?w=800&q=80', 'Detalj sale', 2);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'marko-photography'), 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800', 'Poročna fotografija - detajl', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'marko-photography'), 'https://images.unsplash.com/photo-1502882917128-1aa500764cbd?w=800', 'Poročna fotografija - par', 2);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'dj-sta-pa'), 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'DJ nastop', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'dj-sta-pa'), 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', 'DJ oprema', 2);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'krcma-gostilna'), 'https://images.unsplash.com/photo-1504674900947-ab400cda5fc6?w=800', 'Notranjost gostilne', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'krcma-gostilna'), 'https://images.unsplash.com/photo-1555939594-58d7cb561518?w=800', 'Hrana', 2);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'dekoracije-pro'), 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'Dekoracija poroke', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'dekoracije-pro'), 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800', 'Cvetlična aranžma', 2);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'event-management-slovenija'), 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'Organizacija dogodka', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'event-management-slovenija'), 'https://images.unsplash.com/photo-1519671482677-f32ba5ee53e8?w=800', 'Izvedba dogodka', 2);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'veseli-glasbeniki'), 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', 'Glasbeniki na nastopanju', 1);

INSERT INTO public.provider_gallery (provider_id, image_url, caption, display_order) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'bled-event-hall'), 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800', 'Pogled na Blejsko jezero', 1),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'bled-event-hall'), 'https://images.unsplash.com/photo-1519671482677-f32ba5ee53e8?w=800', 'Sala', 2);

-- ============================================================================
-- PROVIDER AVAILABILITY - Sample availability
-- ============================================================================
INSERT INTO public.provider_availability (provider_id, date, status, notes) VALUES
  ((SELECT id FROM public.provider_profiles WHERE slug = 'marko-photography'), CURRENT_DATE + interval '7 days', 'available', 'Dostopno'),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'marko-photography'), CURRENT_DATE + interval '14 days', 'available', 'Dostopno'),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'dj-sta-pa'), CURRENT_DATE + interval '5 days', 'available', 'Dostopno'),
  ((SELECT id FROM public.provider_profiles WHERE slug = 'dj-sta-pa'), CURRENT_DATE + interval '10 days', 'booked', 'Že rezervirano');

-- ============================================================================
-- NOTIFICATIONS - Helper function to verify schema
-- ============================================================================
-- Grant public access to read providers and categories
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.provider_profiles TO anon, authenticated;
GRANT SELECT ON public.provider_services TO anon, authenticated;
GRANT SELECT ON public.provider_gallery TO anon, authenticated;
GRANT SELECT ON public.provider_availability TO anon, authenticated;
