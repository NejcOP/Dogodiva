import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];
type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
type ProviderService = Database['public']['Tables']['provider_services']['Row'];
type ProviderGallery = Database['public']['Tables']['provider_gallery']['Row'];
type Inquiry = Database['public']['Tables']['inquiries']['Insert'];

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
      .select('*, provider_profiles(business_name, slug)')
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
      .select('provider_profiles(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data?.map((f) => f.provider_profiles) || [];
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
