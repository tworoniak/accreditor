import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { useAuth } from '@/features/auth/useAuth';
import type { RequestTemplate } from '@/types/database';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  subject: z.string().optional(),
  body: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

const field = 'block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300';
const input =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-500/20';
const err = 'mt-1 text-xs text-red-500';

const TOKEN_HINT =
  '{{artist}}  {{venue}}  {{city}}  {{show_date}}  {{publication}}';

interface Props {
  template?: RequestTemplate;
  onSuccess: () => void;
}

export function TemplateForm({ template, onSuccess }: Props) {
  const { profile } = useAuth();
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: template
      ? {
          name: template.name,
          subject: template.subject ?? '',
          body: template.body,
        }
      : {},
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const payload = {
      name: values.name,
      subject: values.subject || null,
      body: values.body,
      created_by: profile?.id ?? null,
    };
    try {
      if (template) {
        await update.mutateAsync({ id: template.id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      onSuccess();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <label className={field}>Template name</label>
        <input
          {...register('name')}
          className={input}
          placeholder='Standard festival pitch'
        />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div>
        <label className={field}>Email subject</label>
        <input
          {...register('subject')}
          className={input}
          placeholder='Photo accreditation request — {{artist}} @ {{venue}}'
        />
      </div>

      <div>
        <label className={field}>Body</label>
        <textarea
          {...register('body')}
          rows={10}
          className={input}
          placeholder={`Hi,\n\nI'd like to request photo accreditation for {{artist}} at {{venue}} on {{show_date}}.\n\nI shoot for {{publication}}.\n\nThanks,\n{{photographer}}`}
        />
        {errors.body && <p className={err}>{errors.body.message}</p>}
        <p className='mt-1.5 font-mono text-xs text-gray-400'>
          Available tokens: {TOKEN_HINT}
        </p>
      </div>

      {submitError && (
        <p className='text-sm text-red-500'>{submitError}</p>
      )}

      <div className='flex justify-end pt-2'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50'
        >
          {isSubmitting
            ? 'Saving…'
            : template
              ? 'Update template'
              : 'Save template'}
        </button>
      </div>
    </form>
  );
}
