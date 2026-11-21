import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];
type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
type ProviderService = Database['public']['Tables']['provider_services']['Row'];
type ProviderGallery = Database['public']['Tables']['provider_gallery']['Row'];
type Inquiry = Database['public']['Tables']['inquiries']['Insert'];
type FavoriteProvider = ProviderProfile & {
  provider_services: (ProviderService & { categories: Pick<Category, 'name'> | null })[];
  provider_gallery: Pick<ProviderGallery, 'image_url' | 'display_order'>[];
};

// ============================================================================
// CATEGORIES
// ============================================================================

export const categoryService = {
  async getAll() {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data as Category[];
  },

  async getBySlug(slug: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error) throw error;
    return data as Category;
  },
};

// ============================================================================
// PROVIDER PROFILES & SERVICES
// ============================================================================

export const providerService = {
  async getAll(filters?: { city?: string; categoryId?: string }) {
    if (!supabase) throw new Error('Supabase not configured');
    let query = supabase
      .from('provider_profiles')
      .select('*, provider_services(*, categories(*)), provider_gallery(*)')
      .eq('is_active', true);

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query.order('is_featured', { ascending: false });
    if (error) throw error;
    return data as (ProviderProfile & {
      provider_services: (ProviderService & { categories: Category })[];
      provider_gallery: ProviderGallery[];
    })[];
  },

  async getById(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_profiles')
      .select(
        `
        *,
        provider_services(
          *,
          categories(*)
        ),
        provider_gallery(*),
        provider_availability(*)
      `
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as ProviderProfile & {
      provider_services: (ProviderService & { categories: Category })[];
      provider_gallery: ProviderGallery[];
    };
  },

  async getBySlug(slug: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_profiles')
      .select(
        `
        *,
        provider_services(
          *,
          categories(*)
        ),
        provider_gallery(*),
        provider_availability(*),
        reviews(id, rating, comment, is_verified)
      `
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as ProviderProfile | null;
  },

  async create(profile: Database['public']['Tables']['provider_profiles']['Insert']) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_profiles')
      .insert([profile])
      .select()
      .single();
    if (error) throw error;
    return data as ProviderProfile;
  },

  async update(id: string, updates: Database['public']['Tables']['provider_profiles']['Update']) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProviderProfile;
  },
};

// ============================================================================
// PROVIDER SERVICES
// ============================================================================

export const serviceService = {
  async getByProviderId(providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_services')
      .select('*, categories(*)')
      .eq('provider_id', providerId)
      .eq('is_active', true);
    if (error) throw error;
    return data as (ProviderService & { categories: Category })[];
  },

  async create(service: Database['public']['Tables']['provider_services']['Insert']) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_services')
      .insert([service])
      .select()
      .single();
    if (error) throw error;
    return data as ProviderService;
  },

  async update(id: string, updates: Database['public']['Tables']['provider_services']['Update']) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('provider_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProviderService;
  },

  async delete(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('provider_services').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================================
// INQUIRIES
// ============================================================================

export const inquiryService = {
  async create(inquiry: Inquiry) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('inquiries')
      .insert([inquiry])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getCustomerInquiries(customerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        provider_profiles(
          business_name,
          slug,
          city,
          provider_services(categories(name))
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getProviderInquiries(providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, profiles(first_name, last_name, email)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// FAVORITES
// ============================================================================

export const favoriteService = {
  async toggle(userId: string, providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single();

    if (existing && !checkError) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, provider_id: providerId }]);
    if (error && error.code !== '23505') throw error;
    return true;
  },

  async getUserFavorites(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        provider_profiles(
          *,
          provider_services(categories(name)),
          provider_gallery(image_url, display_order)
        )
      `)
      .eq('user_id', userId);
    if (error) throw error;
    const rows = (data ?? []) as unknown as {
      provider_profiles: FavoriteProvider | FavoriteProvider[] | null;
    }[];
    return rows.flatMap((row) => {
      if (!row.provider_profiles) return [];
      return Array.isArray(row.provider_profiles)
        ? row.provider_profiles
        : [row.provider_profiles];
    });
  },

  async isFavorite(userId: string, providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },
};

// ============================================================================
// REVIEWS
// ============================================================================

export const reviewService = {
  async getByProviderId(providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(first_name, last_name, avatar_url)')
      .eq('provider_id', providerId)
      .eq('is_verified', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(review: Database['public']['Tables']['reviews']['Insert']) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// CONTACT MESSAGES
// ============================================================================

export const contactService = {
  async submitMessage(message: Database['public']['Tables']['contact_messages']['Insert']) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([message])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

type MarketplaceRequestInsert = Database['public']['Tables']['marketplace_requests']['Insert'];
type MarketplaceRequestUpdate = Database['public']['Tables']['marketplace_requests']['Update'];

export const marketplaceService = {
  async getOpenRequests() {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_requests')
      .select('*, marketplace_offers(id, provider_id)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getProviderRequests(_providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_requests')
      .select('*, profiles(first_name, last_name, email, phone), marketplace_offers(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getCustomerRequests(customerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_requests')
      .select(`
        *,
        marketplace_offers(
          *,
          provider_profiles(id, business_name, slug, city, email, phone)
        ),
        marketplace_messages(
          *,
          provider_profiles(id, business_name, slug, city, email, phone)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createRequest(request: MarketplaceRequestInsert) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_requests')
      .insert(request)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRequest(id: string, updates: MarketplaceRequestUpdate) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createOffer(input: {
    requestId: string;
    providerId: string;
    message: string;
    price?: number | null;
  }) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_offers')
      .insert({
        request_id: input.requestId,
        provider_id: input.providerId,
        message: input.message,
        price: input.price ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateOfferStatus(offerId: string, status: 'accepted' | 'rejected' | 'withdrawn') {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_offers')
      .update({ status })
      .eq('id', offerId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async acceptOffer(offerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.rpc('accept_marketplace_offer', {
      p_offer_id: offerId,
    });
    if (error) throw error;
    return data;
  },

  async getMessages(requestId: string, providerId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_messages')
      .select('*')
      .eq('request_id', requestId)
      .eq('provider_id', providerId)
      .order('created_at');
    if (error) throw error;
    return data ?? [];
  },

  async sendMessage(input: {
    requestId: string;
    providerId: string;
    senderId: string;
    message: string;
  }) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('marketplace_messages')
      .insert({
        request_id: input.requestId,
        provider_id: input.providerId,
        sender_id: input.senderId,
        message: input.message,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
