import { useCallback, useEffect, useState } from 'react';
import { favoriteService, reviewService, inquiryService } from '../services/database';
import type { Database } from '../types/supabase';

export function useFavorite(userId: string | undefined, providerId: string | undefined) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !providerId) return;

    const checkFavorite = async () => {
      try {
        const result = await favoriteService.isFavorite(userId, providerId);
        setIsFavorite(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check favorite'));
      }
    };

    checkFavorite();
  }, [userId, providerId]);

  const toggle = useCallback(async () => {
    if (!userId || !providerId) return;

    setLoading(true);
    try {
      const result = await favoriteService.toggle(userId, providerId);
      setIsFavorite(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle favorite'));
    } finally {
      setLoading(false);
    }
  }, [userId, providerId]);

  return { isFavorite, toggle, loading, error };
}

export function useReviews(providerId: string | undefined) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(!providerId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!providerId) return;

    const fetchReviews = async () => {
      try {
        const data = await reviewService.getByProviderId(providerId);
        setReviews(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [providerId]);

  return { reviews, loading, error };
}

export function useInquiry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (inquiry: Database['public']['Tables']['inquiries']['Insert']) => {
      setLoading(true);
      setError(null);
      try {
        const result = await inquiryService.create(inquiry);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to submit inquiry');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submit, loading, error };
}
