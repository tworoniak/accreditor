import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Band } from '@/types/database';

type BandInsert = Omit<Band, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'pr_contacts' | 'shows'>;
type BandUpdate = Partial<BandInsert> & { id: string };

async function fetchBands() {
  const { data, error } = await supabase
    .from('bands')
    .select('*, pr_contacts!band_pr_contacts(*)')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Band[];
}

export function useBands() {
  return useQuery({ queryKey: ['bands'], queryFn: fetchBands });
}

export function useBand(id: string) {
  return useQuery({
    queryKey: ['bands', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bands')
        .select('*, pr_contacts!band_pr_contacts(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Band;
    },
    enabled: !!id,
  });
}

export function useCreateBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BandInsert) => {
      const { data, error } = await supabase
        .from('bands')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Band;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bands'] }),
  });
}

export function useUpdateBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: BandUpdate) => {
      const { data, error } = await supabase
        .from('bands')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Band;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bands'] });
      qc.invalidateQueries({ queryKey: ['bands', id] });
    },
  });
}

export function useDeleteBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bands').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bands'] }),
  });
}

export function useAddBandContact(bandId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prContactId: string) => {
      const { error } = await supabase
        .from('band_pr_contacts')
        .insert({ band_id: bandId, pr_contact_id: prContactId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bands', bandId] }),
  });
}

export function useRemoveBandContact(bandId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prContactId: string) => {
      const { error } = await supabase
        .from('band_pr_contacts')
        .delete()
        .eq('band_id', bandId)
        .eq('pr_contact_id', prContactId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bands', bandId] }),
  });
}
