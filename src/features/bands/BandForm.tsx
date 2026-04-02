import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateBand, useUpdateBand } from '@/hooks/useBands';
import { useAuth } from '@/features/auth/useAuth';
import type { Band } from '@/types/database';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  genre: z.string().optional(),
  label: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const field = 'block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300';
const input =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-500/20';
const err = 'mt-1 text-xs text-red-500';

interface Props {
  band?: Band;
  onSuccess: () => void;
}

export function BandForm({ band, onSuccess }: Props) {
  const { profile } = useAuth();
  const create = useCreateBand();
  const update = useUpdateBand();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: band
      ? {
          name: band.name,
          genre: band.genre ?? '',
          label: band.label ?? '',
          website: band.website ?? '',
          notes: band.notes ?? '',
        }
      : {},
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      organization_id: profile!.organization_id,
      name: values.name,
      genre: values.genre || null,
      label: values.label || null,
      website: values.website || null,
      notes: values.notes || null,
      created_by: profile?.id ?? null,
    };
    try {
      if (band) {
        await update.mutateAsync({ id: band.id, ...payload });
        toast.success('Band updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('Band added');
      }
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <label className={field}>Band name</label>
        <input {...register('name')} className={input} placeholder='Meshuggah' />
        {errors.name && <p className={err}>{errors.name.message}</p>}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className={field}>Genre</label>
          <input {...register('genre')} className={input} placeholder='Progressive metal' />
        </div>
        <div>
          <label className={field}>Label</label>
          <input {...register('label')} className={input} placeholder='Nuclear Blast' />
        </div>
      </div>

      <div>
        <label className={field}>Website</label>
        <input
          {...register('website')}
          type='url'
          className={input}
          placeholder='https://meshuggah.net'
        />
        {errors.website && <p className={err}>{errors.website.message}</p>}
      </div>

      <div>
        <label className={field}>Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className={input}
          placeholder='Any notes about this band…'
        />
      </div>

      <div className='flex justify-end pt-2'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50'
        >
          {isSubmitting ? 'Saving…' : band ? 'Update band' : 'Add band'}
        </button>
      </div>
    </form>
  );
}
