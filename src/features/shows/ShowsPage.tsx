import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2, Pencil } from 'lucide-react';
import { useShows, useDeleteShow } from '@/hooks/useShows';
import { Modal } from '@/components/ui/Modal';
import { ShowForm } from './ShowForm';
import { formatDate } from '@/lib/utils';
import type { Show } from '@/types/database';

export function ShowsPage() {
  const { data: shows = [], isLoading } = useShows();
  const deleteShow = useDeleteShow();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Show | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const upcoming = shows.filter((s) => new Date(s.show_date) >= new Date());
  const past = shows.filter((s) => new Date(s.show_date) < new Date());

  return (
    <div className='p-8'>
      {deleteError && (
        <div className='mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600'>
          {deleteError}
        </div>
      )}

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Shows</h1>
          <p className='text-sm text-gray-500'>
            {shows.length} total · {upcoming.length} upcoming
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
        >
          <Plus className='h-4 w-4' />
          Add show
        </button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16 text-sm text-gray-400'>
          Loading…
        </div>
      ) : (
        <div className='space-y-8'>
          {upcoming.length > 0 && (
            <Section
              title='Upcoming'
              shows={upcoming}
              onEdit={setEditing}
              onDelete={(id) => deleteShow.mutate(id, { onError: (e) => setDeleteError(e instanceof Error ? e.message : 'Failed to delete show') })}
              onOpen={(id) => navigate('/shows/' + id)}
            />
          )}
          {past.length > 0 && (
            <Section
              title='Past'
              shows={past}
              onEdit={setEditing}
              onDelete={(id) => deleteShow.mutate(id, { onError: (e) => setDeleteError(e instanceof Error ? e.message : 'Failed to delete show') })}
              onOpen={(id) => navigate('/shows/' + id)}
            />
          )}
          {shows.length === 0 && (
            <div className='rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-400'>
              No shows yet — add your first one
            </div>
          )}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title='Add show'
      >
        <ShowForm onSuccess={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title='Edit show'
      >
        {editing && (
          <ShowForm show={editing} onSuccess={() => setEditing(null)} />
        )}
      </Modal>
    </div>
  );
}

interface SectionProps {
  title: string;
  shows: Show[];
  onEdit: (s: Show) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

function Section({ title, shows, onEdit, onDelete, onOpen }: SectionProps) {
  return (
    <div>
      <h2 className='mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400'>
        {title}
      </h2>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {shows.map((show) => (
          <ShowCard
            key={show.id}
            show={show}
            onEdit={() => onEdit(show)}
            onDelete={() => onDelete(show.id)}
            onOpen={() => onOpen(show.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  show: Show;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

function ShowCard({ show, onEdit, onDelete, onOpen }: CardProps) {
  return (
    <div
      className='group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md'
      onClick={onOpen}
    >
      <div className='mb-3 flex items-start justify-between'>
        <p className='font-semibold leading-tight text-gray-900'>
          {show.artist}
        </p>
        <div
          className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            aria-label='Edit show'
            className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={onDelete}
            aria-label='Delete show'
            className='rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
      <div className='space-y-1 text-sm text-gray-500'>
        <div className='flex items-center gap-1.5'>
          <MapPin className='h-3.5 w-3.5 shrink-0' />
          <span>
            {show.venue}, {show.city}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Calendar className='h-3.5 w-3.5 shrink-0' />
          <span>{formatDate(show.show_date)}</span>
        </div>
      </div>
      {show.tour_name && (
        <p className='mt-2 truncate text-xs text-gray-400'>{show.tour_name}</p>
      )}
    </div>
  );
}
