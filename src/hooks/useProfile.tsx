import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Profile } from '@/types/brief';

export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  // Sync theme to <html>
  useEffect(() => {
    const theme = query.data?.theme ?? localStorage.getItem('signaldesk-theme') ?? 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [query.data?.theme]);

  const update = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase.from('profiles').update(patch).eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', user?.id] }),
  });

  return { profile: query.data, isLoading: query.isLoading, update };
}
