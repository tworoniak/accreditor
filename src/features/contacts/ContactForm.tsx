import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts';
import { useBands } from '@/hooks/useBands';
import { supabase } from '@/lib/supabase';
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
  const { data: allBands = [] } = useBands();
  const qc = useQueryClient();

  const originalBandIds = new Set((contact?.bands ?? []).map((b) => b.id));
  const [selectedBandIds, setSelectedBandIds] = useState<Set<string>>(
    new Set(originalBandIds),
  );

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

  function toggleBand(bandId: string) {
    setSelectedBandIds((prev) => {
      const next = new Set(prev);
      next.has(bandId) ? next.delete(bandId) : next.add(bandId);
      return next;
    });
  }

  async function applyBandChanges(contactId: string) {
    const toAdd = [...selectedBandIds].filter((id) => !originalBandIds.has(id));
    const toRemove = [...originalBandIds].filter((id) => !selectedBandIds.has(id));

    const inserts = toAdd.map((band_id) =>
      supabase.from('band_pr_contacts').insert({ band_id, pr_contact_id: contactId }),
    );
    const deletes = toRemove.map((band_id) =>
      supabase
        .from('band_pr_contacts')
        .delete()
        .eq('band_id', band_id)
        .eq('pr_contact_id', contactId),
    );

    await Promise.all([...inserts, ...deletes]);
    qc.invalidateQueries({ queryKey: ['bands'] });
  }

  async function onSubmit(values: FormValues) {
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
        await applyBandChanges(contact.id);
        toast.success('Contact updated');
      } else {
        const created = await create.mutateAsync(payload);
        if (selectedBandIds.size > 0) {
          await applyBandChanges(created.id);
        }
        toast.success('Contact added');
      }
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  const selectedBands = allBands.filter((b) => selectedBandIds.has(b.id));
  const unselectedBands = allBands.filter((b) => !selectedBandIds.has(b.id));

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

      {/* Bands represented */}
      {allBands.length > 0 && (
        <div>
          <label className={field}>Bands represented</label>
          <div className='space-y-2'>
            {selectedBands.length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {selectedBands.map((b) => (
                  <span
                    key={b.id}
                    className='inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  >
                    {b.name}
                    <button
                      type='button'
                      onClick={() => toggleBand(b.id)}
                      aria-label={`Remove ${b.name}`}
                      className='rounded-full hover:text-brand-800 dark:hover:text-brand-200'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {unselectedBands.length > 0 && (
              <select
                className={input}
                value=''
                onChange={(e) => {
                  if (e.target.value) toggleBand(e.target.value);
                }}
              >
                <option value=''>+ Add band…</option>
                {unselectedBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
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
