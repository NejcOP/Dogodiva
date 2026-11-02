import { useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || null);

        if (currentUser) {
          const userProfile = await authService.getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Auth error'));
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data } = authService.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const userProfile = await authService.getProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout error'));
    }
  };

  return { user, profile, loading, error, logout };
}

export function useUser() {
  const { user, profile, loading, error } = useAuth();
  
  const isCustomer = profile?.role === 'customer';
  const isProvider = profile?.role === 'provider';
  const isAdmin = profile?.role === 'admin';

  return { user, profile, loading, error, isCustomer, isProvider, isAdmin };
}
