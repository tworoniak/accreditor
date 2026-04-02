import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Music2, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useBands, useDeleteBand } from '@/hooks/useBands';
import { Modal } from '@/components/ui/Modal';
import { BandForm } from './BandForm';
import type { Band } from '@/types/database';

export function BandsPage() {
  const { data: bands = [], isLoading } = useBands();
  const deleteBand = useDeleteBand();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Band | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Band | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = bands.filter((b) =>
    [b.name, b.genre, b.label].some((v) =>
      v?.toLowerCase().includes(debouncedSearch.toLowerCase()),
    ),
  );

  return (
    <div className='p-8 dark:bg-gray-950 min-h-full'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>Bands</h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>{bands.length} bands</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
        >
          <Plus className='h-4 w-4' />
          Add band
        </button>
      </div>

      <input
        type='search'
        placeholder='Search by name, genre, label'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-6 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-brand-500/20'
      />

      <div aria-live='polite' className='sr-only'>
        {!isLoading && debouncedSearch
          ? `${filtered.length} band${filtered.length !== 1 ? 's' : ''} found`
          : ''}
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16 text-sm text-gray-400'>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className='rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500'>
          {search ? 'No bands match that search' : 'No bands yet — add your first one'}
        </div>
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((band) => (
            <BandCard
              key={band.id}
              band={band}
              onEdit={() => setEditing(band)}
              onDelete={() => setPendingDelete(band)}
              onOpen={() => navigate('/bands/' + band.id)}
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title='Add band'>
        <BandForm onSuccess={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title='Edit band'>
        {editing && <BandForm band={editing} onSuccess={() => setEditing(null)} />}
      </Modal>

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title='Delete band'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Are you sure you want to delete{' '}
            <span className='font-medium'>{pendingDelete?.name ?? 'this band'}</span>? This
            cannot be undone.
          </p>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setPendingDelete(null)}
              className='rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!pendingDelete) return;
                deleteBand.mutate(pendingDelete.id, {
                  onSuccess: () => toast.success('Band deleted'),
                  onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to delete band'),
                });
                setPendingDelete(null);
              }}
              className='rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600'
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface CardProps {
  band: Band;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

const BandCard = memo(function BandCard({ band, onEdit, onDelete, onOpen }: CardProps) {
  return (
    <div
      className='group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900'
      onClick={onOpen}
    >
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <Music2 className='h-4 w-4 shrink-0 text-brand-500' />
          <p className='font-semibold leading-tight text-gray-900 dark:text-gray-100'>
            {band.name}
          </p>
        </div>
        <div
          className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            aria-label='Edit band'
            className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={onDelete}
            aria-label='Delete band'
            className='rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      <div className='space-y-1.5 text-sm text-gray-500 dark:text-gray-400'>
        {band.genre && (
          <span className='inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'>
            {band.genre}
          </span>
        )}
        {band.label && (
          <p className='text-xs text-gray-400 dark:text-gray-500'>{band.label}</p>
        )}
      </div>

      {(band.pr_contacts?.length ?? 0) > 0 && (
        <div className='mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500'>
          <Users className='h-3.5 w-3.5' />
          {band.pr_contacts!.length} publicist{band.pr_contacts!.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
});
