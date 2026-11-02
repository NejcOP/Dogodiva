import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const authService = {
  /**
   * Sign up new user with email and password
   */
  async signUp(email: string, password: string, fullName: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  },

  /**
   * Reset password with token
   */
  async resetPassword(_token: string, newPassword: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Profile | null;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  /**
   * Watch auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) throw new Error('Supabase not configured');

    return supabase.auth.onAuthStateChange(callback);
  },
};
