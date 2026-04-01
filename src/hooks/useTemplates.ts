import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RequestTemplate } from '@/types/database';

type TemplateInsert = Omit<
  RequestTemplate,
  'id' | 'organization_id' | 'created_at' | 'updated_at'
>;
type TemplateUpdate = Partial<TemplateInsert> & { id: string };

async function fetchTemplates() {
  const { data, error } = await supabase
    .from('request_templates')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as RequestTemplate[];
}

export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: fetchTemplates });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function interpolateTemplate(
  body: string,
  vars: Record<string, string>,
): string {
  return body.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => vars[key] != null ? escapeHtml(vars[key]) : '{{' + key + '}}',
  );
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TemplateInsert) => {
      const { data, error } = await supabase
        .from('request_templates')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as RequestTemplate;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: TemplateUpdate) => {
      const { data, error } = await supabase
        .from('request_templates')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as RequestTemplate;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('request_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}
