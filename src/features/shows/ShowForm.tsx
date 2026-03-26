import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateShow, useUpdateShow } from '@/hooks/useShows';
import { useAuth } from '@/features/auth/useAuth';
import type { Show } from '@/types/database';

const schema = z.object({
  artist: z.string().min(1, 'Required'),
  venue: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  show_date: z.string().min(1, 'Required'),
  promoter: z.string().optional(),
  tour_name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const field = 'block text-sm font-medium text-gray-700 mb-1';
const input =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const err = 'mt-1 text-xs text-red-500';

interface Props {
  show?: Show;
  onSuccess: () => void;
}

export function ShowForm({ show, onSuccess }: Props) {
  const { profile } = useAuth();
  const create = useCreateShow();
  const update = useUpdateShow();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: show
      ? {
          artist: show.artist,
          venue: show.venue,
          city: show.city,
          show_date: show.show_date,
          promoter: show.promoter ?? '',
          tour_name: show.tour_name ?? '',
        }
      : {},
  });

  async function onSubmit(values: FormValues) {
    if (show) {
      await update.mutateAsync({ id: show.id, ...values });
    } else {
      await create.mutateAsync({
        ...values,
        promoter: values.promoter || null,
        tour_name: values.tour_name || null,
        created_by: profile?.id ?? null,
      });
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='col-span-2'>
          <label className={field}>Artist</label>
          <input
            {...register('artist')}
            className={input}
            placeholder='Meshuggah'
          />
          {errors.artist && <p className={err}>{errors.artist.message}</p>}
        </div>
        <div>
          <label className={field}>Venue</label>
          <input
            {...register('venue')}
            className={input}
            placeholder='The Truman'
          />
          {errors.venue && <p className={err}>{errors.venue.message}</p>}
        </div>
        <div>
          <label className={field}>City</label>
          <input
            {...register('city')}
            className={input}
            placeholder='Kansas City, MO'
          />
          {errors.city && <p className={err}>{errors.city.message}</p>}
        </div>
        <div>
          <label className={field}>Show date</label>
          <input {...register('show_date')} type='date' className={input} />
          {errors.show_date && (
            <p className={err}>{errors.show_date.message}</p>
          )}
        </div>
        <div>
          <label className={field}>Promoter</label>
          <input
            {...register('promoter')}
            className={input}
            placeholder='Live Nation'
          />
        </div>
        <div className='col-span-2'>
          <label className={field}>Tour name</label>
          <input
            {...register('tour_name')}
            className={input}
            placeholder='Death to All Tour'
          />
        </div>
      </div>

      <div className='flex justify-end gap-2 pt-2'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50'
        >
          {isSubmitting ? 'Saving…' : show ? 'Update show' : 'Add show'}
        </button>
      </div>
    </form>
  );
}
