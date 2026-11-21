import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type ProviderApplication = Database['public']['Tables']['provider_applications']['Row'];

type ProviderApplicationInput = {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  categoryId: string;
  city: string;
  region: string;
  website: string | null;
  description: string;
  termsAccepted: boolean;
};

export const providerApplicationService = {
  async submitApplication(input: ProviderApplicationInput) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');

    const { data, error } = await supabase.rpc('submit_provider_application', {
      p_business_name: input.businessName,
      p_contact_person: input.contactPerson,
      p_email: input.email,
      p_phone: input.phone,
      p_category_id: input.categoryId,
      p_city: input.city,
      p_region: input.region,
      p_website: input.website,
      p_description: input.description,
      p_terms_accepted: input.termsAccepted,
    });

    if (error) throw error;
    return data;
  },

  async getCurrentApplication() {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) return null;

    const { data: claimed, error: claimError } = await supabase.rpc('claim_provider_applications');
    if (claimError) throw claimError;

    return (claimed?.[0] ?? null) as ProviderApplication | null;
  },

  async getUserApplications(userId: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .or(`user_id.eq.${userId},submitted_by.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getApplication(applicationId: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const providerApplicationAdminService = {
  async getAllApplications(filters?: { status?: string; category_id?: string }) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    let query = supabase.from('provider_applications').select('*');
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.category_id) query = query.eq('category_id', filters.category_id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async approveApplication(applicationId: string, reviewNotes?: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase.rpc('approve_provider_application', {
      p_application_id: applicationId,
      p_review_notes: reviewNotes ?? null,
    });
    if (error) throw error;
    return data;
  },

  async rejectApplication(applicationId: string, reviewNotes: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Prijavite se kot administrator.');
    const { data, error } = await supabase
      .from('provider_applications')
      .update({
        status: 'rejected',
        reviewed_by: user.user.id,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
