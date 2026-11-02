import { supabase } from '../lib/supabase';

// ============================================================================
// STORAGE BUCKETS
// ============================================================================

export const storageService = {
  /**
   * Upload avatar image
   * @param userId User ID (used as folder)
   * @param file Image file to upload
   * @returns Public URL of the uploaded file
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${userId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/${fileName}`);
    return data.publicUrl;
  },

  /**
   * Upload provider logo
   */
  async uploadProviderLogo(providerId: string, file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('provider-logos')
      .upload(`${providerId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('provider-logos').getPublicUrl(`${providerId}/${fileName}`);
    return data.publicUrl;
  },

  /**
   * Upload provider cover image
   */
  async uploadProviderCover(providerId: string, file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const fileName = `cover-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('provider-covers')
      .upload(`${providerId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('provider-covers').getPublicUrl(`${providerId}/${fileName}`);
    return data.publicUrl;
  },

  /**
   * Upload provider gallery image
   */
  async uploadGalleryImage(providerId: string, file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const fileName = `gallery-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('provider-gallery')
      .upload(`${providerId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('provider-gallery')
      .getPublicUrl(`${providerId}/${fileName}`);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: 'avatars' | 'provider-logos' | 'provider-covers' | 'provider-gallery', path: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
