import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts';
import type { PrContact } from '@/types/database';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const field = 'block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300';
const input =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-500/20';
const err = 'mt-1 text-xs text-red-500';

interface Props {
  contact?: PrContact;
  onSuccess: () => void;
}

export function ContactForm({ contact, onSuccess }: Props) {
  const create = useCreateContact();
  const update = useUpdateContact();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email ?? '',
          company: contact.company ?? '',
          phone: contact.phone ?? '',
          notes: contact.notes ?? '',
        }
      : {},
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const payload = {
      name: values.name,
      email: values.email || null,
      company: values.company || null,
      phone: values.phone || null,
      notes: values.notes || null,
    };
    try {
      if (contact) {
        await update.mutateAsync({ id: contact.id, ...payload });
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
      <div className='grid grid-cols-2 gap-4'>
        <div className='col-span-2'>
          <label className={field}>Name</label>
          <input
            {...register('name')}
            className={input}
            placeholder='Sarah Mitchell'
          />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={field}>Email</label>
          <input
            {...register('email')}
            type='email'
            className={input}
            placeholder='sarah@labelpr.com'
          />
          {errors.email && <p className={err}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={field}>Phone</label>
          <input
            {...register('phone')}
            className={input}
            placeholder='+1 555 000 0000'
          />
        </div>
        <div className='col-span-2'>
          <label className={field}>Company</label>
          <input
            {...register('company')}
            className={input}
            placeholder='Nuclear Blast PR'
          />
        </div>
        <div className='col-span-2'>
          <label className={field}>Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className={input}
            placeholder='Prefers email over phone. Usually responds within 48h.'
          />
        </div>
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
            : contact
              ? 'Update contact'
              : 'Add contact'}
        </button>
      </div>
    </form>
  );
}
