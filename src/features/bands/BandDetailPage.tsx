import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Plus, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useBand, useAddBandContact, useRemoveBandContact } from '@/hooks/useBands';
import { useContacts } from '@/hooks/useContacts';
import { Modal } from '@/components/ui/Modal';
import { BandForm } from './BandForm';
import type { PrContact } from '@/types/database';

export function BandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: band, isLoading } = useBand(id!);
  const { data: allContacts = [] } = useContacts();
  const addContact = useAddBandContact(id!);
  const removeContact = useRemoveBandContact(id!);

  const [editOpen, setEditOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<PrContact | null>(null);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center text-sm text-gray-400'>
        Loading…
      </div>
    );
  }

  if (!band) {
    return (
      <div className='flex h-full items-center justify-center text-sm text-gray-400 dark:bg-gray-950'>
        Band not found
      </div>
    );
  }

  const linkedContactIds = new Set((band.pr_contacts ?? []).map((c) => c.id));
  const availableContacts = allContacts.filter((c) => !linkedContactIds.has(c.id));

  return (
    <div className='p-8 dark:bg-gray-950 min-h-full'>
      <button
        onClick={() => navigate('/bands')}
        className='mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to bands
      </button>

      {/* Header */}
      <div className='mb-8 flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
            {band.name}
          </h1>
          <div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400'>
            {band.genre && (
              <span className='rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'>
                {band.genre}
              </span>
            )}
            {band.label && <span>{band.label}</span>}
            {band.website && (
              <a
                href={band.website}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-brand-500 hover:underline'
              >
                <ExternalLink className='h-3.5 w-3.5' />
                Website
              </a>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className='flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
        >
          <Pencil className='h-3.5 w-3.5' />
          Edit band
        </button>
      </div>

      {band.notes && (
        <div className='mb-8 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
          {band.notes}
        </div>
      )}

      {/* Publicists */}
      <section className='mb-8'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
            Publicists
          </h2>
          {availableContacts.length > 0 && (
            <button
              onClick={() => setAddContactOpen(true)}
              className='flex items-center gap-1 text-xs text-brand-500 hover:underline'
            >
              <Plus className='h-3.5 w-3.5' />
              Add publicist
            </button>
          )}
        </div>

        {(band.pr_contacts ?? []).length === 0 ? (
          <div className='rounded-xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500'>
            No publicists linked yet
          </div>
        ) : (
          <div className='space-y-2'>
            {band.pr_contacts!.map((contact) => (
              <div
                key={contact.id}
                className='flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900'
              >
                <div>
                  <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                    {contact.name}
                  </p>
                  <p className='text-xs text-gray-400 dark:text-gray-500'>
                    {[contact.company, contact.email].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => setPendingRemove(contact)}
                  aria-label={`Remove ${contact.name}`}
                  className='rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title='Edit band'>
        <BandForm band={band} onSuccess={() => setEditOpen(false)} />
      </Modal>

      {/* Add publicist Modal */}
      <Modal
        open={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        title='Add publicist'
      >
        <div className='space-y-2'>
          {availableContacts.length === 0 ? (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              All contacts are already linked to this band.
            </p>
          ) : (
            availableContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  addContact.mutate(c.id, {
                    onSuccess: () => toast.success('Publicist added'),
                    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to add publicist'),
                  });
                  setAddContactOpen(false);
                }}
                className='flex w-full flex-col rounded-lg border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
              >
                <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                  {c.name}
                </span>
                <span className='text-xs text-gray-400 dark:text-gray-500'>
                  {[c.company, c.email].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Remove publicist confirmation */}
      <Modal
        open={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        title='Remove publicist'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Remove{' '}
            <span className='font-medium'>{pendingRemove?.name}</span> from this band's
            publicists?
          </p>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setPendingRemove(null)}
              className='rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!pendingRemove) return;
                removeContact.mutate(pendingRemove.id, {
                  onSuccess: () => toast.success('Publicist removed'),
                  onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove publicist'),
                });
                setPendingRemove(null);
              }}
              className='rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600'
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
