import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type ProviderApplication = Database['public']['Tables']['provider_applications']['Row'];
type ProviderApplicationInsert = Database['public']['Tables']['provider_applications']['Insert'];

export const providerApplicationService = {
  /**
   * Submit a new provider application
   */
  async submitApplication(data: ProviderApplicationInsert) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: result, error } = await supabase
      .from('provider_applications')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as ProviderApplication;
  },

  /**
   * Get user's own applications
   */
  async getUserApplications(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProviderApplication[];
  },

  /**
   * Get single application by ID (for user)
   */
  async getApplication(applicationId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as ProviderApplication | null;
  },

  /**
   * Check if user already has a pending/approved application
   */
  async checkExistingApplication(email: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('provider_applications')
      .select('id, status')
      .eq('email', email)
      .in('status', ['pending', 'approved'])
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

export const providerApplicationAdminService = {
  /**
   * Get all applications (admin only)
   */
  async getAllApplications(filters?: { status?: string; category_id?: string }) {
    if (!supabase) throw new Error('Supabase not configured');

    let query = supabase.from('provider_applications').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as ProviderApplication[];
  },

  /**
   * Approve an application
   */
  async approveApplication(applicationId: string, reviewNotes?: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('provider_applications')
      .update({
        status: 'approved',
        reviewed_by: user.user.id,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data as ProviderApplication;
  },

  /**
   * Reject an application
   */
  async rejectApplication(applicationId: string, reviewNotes: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

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
    return data as ProviderApplication;
  },
};
