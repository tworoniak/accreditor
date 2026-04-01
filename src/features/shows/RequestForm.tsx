import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRequest } from '@/hooks/useRequests';
import { useContacts } from '@/hooks/useContacts';
import { useTemplates } from '@/hooks/useTemplates';
import { useAuth } from '@/features/auth/useAuth';

const schema = z.object({
  pr_contact_id: z.string().optional(),
  template_id: z.string().optional(),
  submission_deadline: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const field = 'block text-sm font-medium text-gray-700 mb-1';
const input =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

interface Props {
  showId: string;
  onSuccess: () => void;
}

export function RequestForm({ showId, onSuccess }: Props) {
  const { profile } = useAuth();
  const createRequest = useCreateRequest();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: contacts = [] } = useContacts();
  const { data: templates = [] } = useTemplates();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const minDeadline = new Date().toISOString().slice(0, 16);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await createRequest.mutateAsync({
        show_id: showId,
        photographer_id: profile!.id,
        pr_contact_id: values.pr_contact_id || null,
        template_id: values.template_id || null,
        submission_deadline: values.submission_deadline || null,
        notes: values.notes || null,
        status: 'upcoming',
      });
      onSuccess();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <label className={field}>PR contact</label>
        <select {...register('pr_contact_id')} className={input}>
          <option value=''>— Select contact —</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.company ? ` · ${c.company}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={field}>Template</label>
        <select {...register('template_id')} className={input}>
          <option value=''>— Select template —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={field}>Submission deadline</label>
        <input
          {...register('submission_deadline')}
          type='datetime-local'
          min={minDeadline}
          className={input}
        />
      </div>

      <div>
        <label className={field}>Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className={input}
          placeholder='Any relevant notes…'
        />
      </div>

      {submitError && (
        <p className='text-sm text-red-500'>{submitError}</p>
      )}

      <div className='flex justify-end pt-2'>
        <button
          type='submit'
          disabled={isSubmitting || !profile}
          className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50'
        >
          {isSubmitting ? 'Creating…' : 'Create request'}
        </button>
      </div>
    </form>
  );
}
