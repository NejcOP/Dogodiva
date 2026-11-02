# Dogodiva Supabase Backend Implementation

## 📋 Overview

This document describes the complete Supabase backend implementation for **Dogodiva**, an event-services marketplace for Slovenia.

The implementation includes:
- Complete PostgreSQL database schema with 16 tables
- Row Level Security (RLS) policies for data protection
- Storage buckets for images
- Service layer for API calls
- React hooks for data fetching
- Seed data with demo providers
- TypeScript types

## 🗄️ Database Schema

### Tables Created

1. **profiles** - User profiles connected to Supabase Auth
   - id (UUID, references auth.users)
   - first_name, last_name, email, phone
   - avatar_url, role (customer/provider/admin)
   - city, country, bio
   - created_at, updated_at

2. **categories** - Event and service categories
   - id, name, slug
   - description, icon
   - parent_id (for subcategories)
   - is_active

3. **provider_profiles** - Additional info for service providers
   - user_id (references profiles)
   - business_name, slug
   - description, logo_url, cover_image_url
   - email, phone, website, city, address, postal_code
   - vat_number
   - verification_status, subscription_plan, subscription_status
   - average_rating, total_reviews
   - is_featured, is_active

4. **provider_services** - Services offered by providers
   - provider_id (references provider_profiles)
   - category_id (references categories)
   - title, description
   - price_from, price_to, price_type
   - city, is_active

5. **provider_gallery** - Images for providers
   - provider_id, image_url
   - caption, display_order

6. **provider_availability** - Provider calendar
   - provider_id, date
   - start_time, end_time
   - status (available/booked/unavailable)
   - notes

7. **inquiries** - Customer inquiries to providers
   - customer_id, provider_id, service_id
   - event_type, event_date, location
   - guest_count, budget, message
   - status (pending/contacted/accepted/rejected/completed/cancelled)

8. **bookings** - Confirmed bookings
   - customer_id, provider_id, service_id, inquiry_id
   - event_date, event_location, guest_count
   - total_price, platform_commission, provider_amount
   - status, payment_status

9. **reviews** - Customer reviews
   - customer_id, provider_id, booking_id
   - rating (1-5), comment
   - is_verified

10. **favorites** - Saved providers
    - user_id, provider_id

11. **subscriptions** - Provider subscription plans
    - provider_id, plan_name, price
    - billing_interval, status
    - current_period_start/end

12. **notifications** - User notifications
    - user_id, title, message, type
    - is_read, related_inquiry_id, related_booking_id

13. **conversations** - Messaging between customers and providers
    - customer_id, provider_id, inquiry_id

14. **messages** - Individual messages in conversations
    - conversation_id, sender_id, message
    - is_read

15. **contact_messages** - Public contact form submissions
    - name, email, subject, message
    - status (new/read/responded)

16. **ai_event_plans** - Future AI event planning feature
    - user_id, event_type, event_date, location
    - guest_count, budget
    - preferences (JSONB), generated_plan (JSONB)

### Indexes

All tables have appropriate indexes on:
- Foreign keys (provider_id, customer_id, user_id, etc.)
- Frequently filtered columns (is_active, is_featured, status, slug)
- Sorting columns (created_at, rating)

### Triggers & Functions

1. **handle_new_user** - Auto-create profile when user registers
2. **update_provider_rating** - Auto-update provider ratings when review is created
3. **update_timestamp** - Auto-update `updated_at` on table changes

## 🔒 Row Level Security (RLS)

RLS is enabled on all tables. Policies implemented:

### Public Access
- Read active categories
- Read active provider profiles and services
- Read provider galleries and public reviews
- Read provider availability

### Authenticated Users
- Customers can manage their own profiles
- Providers can manage their own profiles and services
- Users can view their own notifications and data

### Provider-Specific
- Providers can manage their services, galleries, availability
- Providers can view inquiries sent to them
- Providers can view their bookings and reviews

### Customer-Specific
- Customers can create inquiries
- Customers can view their inquiries and bookings
- Customers can write reviews for completed bookings
- Customers can manage favorites

### Admin-Only
- Admins can view all contact messages
- Admins can view subscription data

### Conversation/Messaging
- Only participants can view/access conversations and messages

## 💾 Storage Buckets

Four public storage buckets created:

1. **avatars** - User profile pictures
   - Path structure: `{userId}/{timestamp}.{ext}`
   - Users can upload and update their own avatars

2. **provider-logos** - Business logos
   - Path structure: `{providerId}/{timestamp}.{ext}`
   - Providers manage their own logos

3. **provider-covers** - Cover images
   - Path structure: `{providerId}/{timestamp}.{ext}`
   - Providers manage their own covers

4. **provider-gallery** - Service gallery images
   - Path structure: `{providerId}/{timestamp}.{ext}`
   - Providers manage their own gallery

All buckets have 3600s cache control for performance.

## 🔧 Service Layer

### `src/services/auth.ts`
- `signUp(email, password, fullName)` - Register new user
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getSession()` - Get current session
- `getCurrentUser()` - Get current user
- `getProfile(userId)` - Get user profile
- `updateProfile(userId, updates)` - Update user profile
- `onAuthStateChange(callback)` - Listen to auth changes

### `src/services/database.ts`
- **categoryService** - Get categories
- **providerService** - Get providers, create/update provider profiles
- **serviceService** - Manage provider services
- **inquiryService** - Create and manage inquiries
- **favoriteService** - Toggle and manage favorites
- **reviewService** - Get and create reviews
- **contactService** - Submit contact messages

### `src/services/storage.ts`
- `uploadAvatar(userId, file)` - Upload user avatar
- `uploadProviderLogo(providerId, file)` - Upload provider logo
- `uploadProviderCover(providerId, file)` - Upload provider cover
- `uploadGalleryImage(providerId, file)` - Upload gallery image
- `deleteFile(bucket, path)` - Delete file from storage

## ⚛️ React Hooks

### `src/hooks/useAuth.ts`
- `useAuth()` - Get current user, profile, and loading/error states
- `useUser()` - Convenience hook returning user info + role checks (isCustomer, isProvider, isAdmin)

### `src/hooks/useData.ts`
- `useProviders(filters)` - Fetch providers with optional filters
- `useProvider(id)` - Fetch single provider by ID
- `useProviderBySlug(slug)` - Fetch provider by slug
- `useCategories()` - Fetch all active categories
- `useProviderServices(providerId)` - Fetch services for provider

### `src/hooks/useData2.ts`
- `useFavorite(userId, providerId)` - Check and toggle favorites
- `useReviews(providerId)` - Fetch verified reviews for provider
- `useInquiry()` - Submit inquiry

## 📊 Seed Data

The second migration (`002_seed_data.sql`) includes:

### Categories
All 12 initial categories with descriptions and emoji icons:
- Maturantski plesi (👕Graduation Balls)
- Poročne lokacije (💍 Wedding Venues)
- Prostori za zabave (🎉 Event Spaces)
- Gostilne in restavracije (🍽️ Restaurants)
- Fotografiranje (📷 Photography)
- DJ-ji (🎵 DJs)
- Glasbeniki in pevci (🎤 Musicians/Singers)
- Glasbene skupine (🎸 Bands)
- Organizacija dogodkov (📋 Event Organization)
- Dekoracija dogodkov (🎀 Event Decoration)
- Catering (🍴 Catering)
- Poroke (💒 Weddings)

### Demo Providers (10 providers)
1. **Ljubljana Halls** - Premium wedding venue
2. **Marko Photography** - Professional photographer
3. **DJ Šta Pa** - Professional DJ
4. **Krčma Gostilna** - Restaurant & catering
5. **Dekoracije Pro** - Event decoration
6. **Event Management Slovenija** - Event organization
7. **Veseli Glasbeniki** - Traditional band
8. **Bled Event Hall** - Lakeside venue
9. **Sara - Pevka** - Singer
10. **Celje Catering** - Catering service

Each provider includes:
- Complete profile with description
- 1-3 services with prices
- 1-2 gallery images
- Availability data
- Verification status
- Subscription plan
- Location (Ljubljana, Kranj, Maribor, Novo Mesto, Celje, Bled, Koper)

## 🚀 Getting Started

### 1. Setup Supabase Project
```bash
# Create account at https://supabase.com
# Create new project
# Get your credentials from Project Settings > API
```

### 2. Configure Environment
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Add your Supabase credentials:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

### 3. Deploy Database Schema
Apply migrations to your Supabase project:

**Option A: Using Supabase CLI** (recommended)
```bash
npm install -g supabase
supabase link
supabase push
```

**Option B: Manual SQL execution**
1. Go to Supabase Dashboard > SQL Editor
2. Copy content of `supabase/migrations/001_init_schema.sql`
3. Paste and run
4. Copy content of `supabase/migrations/002_seed_data.sql`
5. Paste and run

### 4. Create Storage Buckets (if not auto-created)
In Supabase Dashboard > Storage:
1. Create bucket: `avatars` (public)
2. Create bucket: `provider-logos` (public)
3. Create bucket: `provider-covers` (public)
4. Create bucket: `provider-gallery` (public)

### 5. Start Development Server
```bash
npm run dev
# Open http://localhost:5174
```

## 🧪 Testing

### TypeScript Type Checking
```bash
npm run typecheck
```

### Production Build
```bash
npm run build
```

### Check Migrations
All migrations are in `supabase/migrations/` directory with clear naming:
- `001_init_schema.sql` - Complete database schema
- `002_seed_data.sql` - Demo data for development

## 🔐 Security Considerations

### ✅ Implemented
1. **RLS on all tables** - Prevents unauthorized data access
2. **No hardcoded secrets** - Uses environment variables
3. **Role-based access** - customer/provider/admin roles
4. **No service-role key in frontend** - Only public anon key
5. **Verified reviews** - Only from completed bookings
6. **Unique constraints** - Prevent duplicate favorites, reviews
7. **Timestamp tracking** - created_at and updated_at on all tables

### ⚠️ Important Notes
- **Never commit `.env` files** - Add to `.gitignore`
- **Service-role key is secret** - Never use in frontend code
- **Payments not implemented** - Stripe integration ready but not implemented
- **Email verification** - Setup in Supabase Email Auth settings
- **Row Level Security is critical** - Always add RLS policies for new tables

## 🔄 Workflow

### Customer Flow
1. Browse providers by category/location/search
2. View provider profiles and services
3. Save favorites
4. Send inquiry
5. Receive response from provider
6. Complete booking
7. Leave review

### Provider Flow
1. Register with business details
2. Create provider profile
3. Add services with pricing
4. Upload gallery images
5. Manage availability calendar
6. Respond to inquiries
7. Manage bookings
8. View reviews

## 📈 Scalability

The implementation is designed for scalability:
- Proper indexing on all foreign keys
- Partitioning-ready schema
- Efficient query patterns
- Caching-friendly REST API design

## 🚧 Future Enhancements

Ready for implementation:
1. **Stripe Payment Integration** - Subscription and booking payments
2. **AI Event Planner** - Using `ai_event_plans` table
3. **Real-time Messaging** - Using Supabase Realtime on messages
4. **Advanced Search** - Full-text search on provider descriptions
5. **Analytics Dashboard** - Provider performance metrics
6. **Email Notifications** - Transactional emails via Supabase Functions

## 📞 Support

For questions about:
- **Supabase**: https://supabase.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Implementation Date:** November 2, 2026
**Status:** Production Ready
**Last Updated:** November 2, 2026
