import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
type ProviderPlan = ProviderProfile['subscription_plan'];

export const adminService = {
  async getProviders() {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*, profiles(first_name, last_name, email), provider_services(categories(name))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateProvider(
    providerId: string,
    updates: {
      is_featured?: boolean;
      is_active?: boolean;
      subscription_plan?: ProviderPlan;
    },
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

  async getContactMessages() {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async resolveContactMessage(messageId: string) {
    if (!supabase) throw new Error('Supabase ni konfiguriran.');
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status: 'responded' })
      .eq('id', messageId)
      .select()
      .single();
    if (error) throw error;
    return data as ContactMessage;
  },
};
