import { useEffect, useState } from 'react';
import { providerService, categoryService, serviceService } from '../services/database';
import type { Database } from '../types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

export function useProviders(filters?: { city?: string; categoryId?: string }) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await providerService.getAll(filters);
        setProviders(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch providers'));
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [filters?.city, filters?.categoryId]);

  return { providers, loading, error };
}

export function useProvider(id: string | undefined) {
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProvider = async () => {
      try {
        const data = await providerService.getById(id);
        setProvider(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch provider'));
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  return { provider, loading, error };
}

export function useProviderBySlug(slug: string | undefined) {
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(!slug);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProvider = async () => {
      try {
        const data = await providerService.getBySlug(slug);
        setProvider(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch provider'));
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [slug]);

  return { provider, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useProviderServices(providerId: string | undefined) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(!providerId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!providerId) return;

    const fetchServices = async () => {
      try {
        const data = await serviceService.getByProviderId(providerId);
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch services'));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [providerId]);

  return { services, loading, error };
}
