import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Show } from '@/types/database';

type ShowInsert = Omit<
  Show,
  'id' | 'organization_id' | 'created_at' | 'updated_at'
>;
type ShowUpdate = Partial<ShowInsert> & { id: string };

async function fetchShows() {
  const { data, error } = await supabase
    .from('shows')
    .select('*')
    .order('show_date', { ascending: true });
  if (error) throw error;
  return data as Show[];
}

export function useShows() {
  return useQuery({ queryKey: ['shows'], queryFn: fetchShows });
}

export function useCreateShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ShowInsert) => {
      const { data, error } = await supabase
        .from('shows')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Show;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shows'] }),
  });
}

export function useUpdateShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ShowUpdate) => {
      const { data, error } = await supabase
        .from('shows')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Show;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shows'] }),
  });
}

export function useDeleteShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shows'] });
      qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
