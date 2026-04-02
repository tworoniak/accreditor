import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PrContact } from '@/types/database';

type ContactInsert = Omit<
  PrContact,
  'id' | 'organization_id' | 'created_at' | 'updated_at' | 'bands'
>;
type ContactUpdate = Partial<ContactInsert> & { id: string };

async function fetchContacts() {
  const { data, error } = await supabase
    .from('pr_contacts')
    .select('*, bands!band_pr_contacts(id, name)')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as PrContact[];
}

export function useContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: fetchContacts });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ContactInsert) => {
      const { data, error } = await supabase
        .from('pr_contacts')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as PrContact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ContactUpdate) => {
      const { data, error } = await supabase
        .from('pr_contacts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as PrContact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pr_contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
