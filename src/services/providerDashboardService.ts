import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
type ProviderServiceRow = Database['public']['Tables']['provider_services']['Row'];
type GalleryRow = Database['public']['Tables']['provider_gallery']['Row'];
type Inquiry = Database['public']['Tables']['inquiries']['Row'];
type UnavailableDate = Database['public']['Tables']['provider_unavailable_dates']['Row'];

export type ProviderInquiry = Inquiry & {
  profiles: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'first_name' | 'last_name' | 'email' | 'phone'
  > | null;
};

export type ProviderDashboardData = {
  provider: ProviderProfile;
  inquiries: ProviderInquiry[];
  services: ProviderServiceRow[];
  gallery: GalleryRow[];
  unavailableDates: UnavailableDate[];
};

export const providerDashboardService = {
  async loadForUser(userId: string): Promise<ProviderDashboardData | null> {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');

    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (providerError) throw providerError;
    if (!provider) return null;

    const [inquiries, services, gallery, unavailableDates] = await Promise.all([
      supabase
        .from('inquiries')
        .select('*, profiles(first_name, last_name, email, phone)')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at'),
      supabase
        .from('provider_gallery')
        .select('*')
        .eq('provider_id', provider.id)
        .order('display_order'),
      supabase
        .from('provider_unavailable_dates')
        .select('*')
        .eq('provider_id', provider.id)
        .order('unavailable_date'),
    ]);

    const results = [inquiries, services, gallery, unavailableDates];
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    return {
      provider,
      inquiries: (inquiries.data ?? []) as ProviderInquiry[],
      services: services.data ?? [],
      gallery: gallery.data ?? [],
      unavailableDates: unavailableDates.data ?? [],
    };
  },

  async updateProfile(
    providerId: string,
    updates: Database['public']['Tables']['provider_profiles']['Update'],
  ) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('provider_profiles')
      .update(updates)
      .eq('id', providerId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateInquiryStatus(
    inquiryId: string,
    status: Database['public']['Tables']['inquiries']['Row']['status'],
  ) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', inquiryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async saveService(
    serviceId: string | null,
    input: Database['public']['Tables']['provider_services']['Insert'],
  ) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const query = serviceId
      ? supabase.from('provider_services').update(input).eq('id', serviceId)
      : supabase.from('provider_services').insert(input);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },

  async deleteService(serviceId: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { error } = await supabase.from('provider_services').delete().eq('id', serviceId);
    if (error) throw error;
  },

  async saveGalleryImage(input: Database['public']['Tables']['provider_gallery']['Insert']) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('provider_gallery')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateGalleryCaption(imageId: string, caption: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('provider_gallery')
      .update({ caption })
      .eq('id', imageId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteGalleryImage(imageId: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { error } = await supabase.from('provider_gallery').delete().eq('id', imageId);
    if (error) throw error;
  },

  async toggleUnavailableDate(providerId: string, date: string, existingId?: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    if (existingId) {
      const { error } = await supabase
        .from('provider_unavailable_dates')
        .delete()
        .eq('id', existingId);
      if (error) throw error;
      return null;
    }

    const { data, error } = await supabase
      .from('provider_unavailable_dates')
      .insert({ provider_id: providerId, unavailable_date: date })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
