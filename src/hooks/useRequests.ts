import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  AccreditationRequest,
  AccreditationStatus,
} from '@/types/database';

type RequestInsert = {
  show_id: string;
  photographer_id: string;
  pr_contact_id?: string | null;
  template_id?: string | null;
  status?: AccreditationStatus;
  submission_deadline?: string | null;
  notes?: string | null;
};

type RequestUpdate = Partial<
  Omit<
    AccreditationRequest,
    'id' | 'organization_id' | 'created_at' | 'updated_at'
  >
> & { id: string };

async function fetchRequests() {
  const { data, error } = await supabase
    .from('accreditation_requests')
    .select(
      `
      *,
      show:shows(*),
      pr_contact:pr_contacts(*),
      photographer:profiles(id, full_name, avatar_url)
    `,
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as AccreditationRequest[];
}

export function useRequests() {
  return useQuery({ queryKey: ['requests'], queryFn: fetchRequests });
}

export function useRequestsByShow(showId: string) {
  return useQuery({
    queryKey: ['requests', 'show', showId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accreditation_requests')
        .select(
          `
          *,
          show:shows(*),
          pr_contact:pr_contacts(*),
          photographer:profiles(id, full_name, avatar_url)
        `,
        )
        .eq('show_id', showId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AccreditationRequest[];
    },
    enabled: !!showId,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RequestInsert) => {
      const { data, error } = await supabase
        .from('accreditation_requests')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as AccreditationRequest;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: RequestUpdate) => {
      const { data, error } = await supabase
        .from('accreditation_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AccreditationRequest;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AccreditationStatus;
    }) => {
      const extra: Partial<AccreditationRequest> = {};
      if (status === 'submitted') extra.submitted_at = new Date().toISOString();
      if (['granted', 'rejected', 'waitlisted'].includes(status))
        extra.response_received_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('accreditation_requests')
        .update({ status, ...extra })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AccreditationRequest;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}
