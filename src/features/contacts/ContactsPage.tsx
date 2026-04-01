import { memo, useEffect, useState } from 'react';
import { Plus, Mail, Phone, Building2, Pencil, Trash2 } from 'lucide-react';
import { useContacts, useDeleteContact } from '@/hooks/useContacts';
import { Modal } from '@/components/ui/Modal';
import { ContactForm } from './ContactForm';
import type { PrContact } from '@/types/database';

export function ContactsPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const deleteContact = useDeleteContact();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PrContact | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = contacts.filter((c) =>
    [c.name, c.company, c.email].some((v) =>
      v?.toLowerCase().includes(debouncedSearch.toLowerCase()),
    ),
  );

  return (
    <div className='p-8'>
      {deleteError && (
        <div className='mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600'>
          {deleteError}
        </div>
      )}

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>PR Contacts</h1>
          <p className='text-sm text-gray-500'>{contacts.length} contacts</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
        >
          <Plus className='h-4 w-4' />
          Add contact
        </button>
      </div>

      <input
        type='search'
        placeholder='Search by name, company, email'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-6 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
      />

      {isLoading ? (
        <div className='flex justify-center py-16 text-sm text-gray-400'>
          Loading
        </div>
      ) : filtered.length === 0 ? (
        <div className='rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-400'>
          {search
            ? 'No contacts match that search'
            : 'No contacts yet — add your first one'}
        </div>
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => setEditing(contact)}
              onDelete={() => setPendingDelete(contact.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title='Add contact'
      >
        <ContactForm onSuccess={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title='Edit contact'
      >
        {editing && (
          <ContactForm contact={editing} onSuccess={() => setEditing(null)} />
        )}
      </Modal>

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title='Delete contact'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Are you sure you want to delete{' '}
            <span className='font-medium'>
              {contacts.find((c) => c.id === pendingDelete)?.name ?? 'this contact'}
            </span>
            ? This cannot be undone.
          </p>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setPendingDelete(null)}
              className='rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!pendingDelete) return;
                deleteContact.mutate(pendingDelete, {
                  onError: (e) => setDeleteError(e instanceof Error ? e.message : 'Failed to delete contact'),
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
  contact: PrContact;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactCard = memo(function ContactCard({ contact, onEdit, onDelete }: CardProps) {
  return (
    <div className='group rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md'>
      <div className='mb-3 flex items-start justify-between'>
        <div>
          <p className='font-semibold text-gray-900'>{contact.name}</p>
          {contact.company && (
            <p className='text-xs text-gray-400'>{contact.company}</p>
          )}
        </div>
        <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          <button
            onClick={onEdit}
            aria-label='Edit contact'
            className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={onDelete}
            aria-label='Delete contact'
            className='rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      <div className='space-y-1.5'>
        {contact.email && (
          <div className='flex items-center gap-2 text-xs text-gray-500'>
            <Mail className='h-3.5 w-3.5 shrink-0' />
            <a
              href={'mailto:' + contact.email}
              className='hover:text-brand-500'
              onClick={(e) => e.stopPropagation()}
            >
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className='flex items-center gap-2 text-xs text-gray-500'>
            <Phone className='h-3.5 w-3.5 shrink-0' />
            {contact.phone}
          </div>
        )}
        {contact.company && (
          <div className='flex items-center gap-2 text-xs text-gray-500'>
            <Building2 className='h-3.5 w-3.5 shrink-0' />
            {contact.company}
          </div>
        )}
      </div>

      {contact.notes && (
        <p className='mt-3 line-clamp-2 border-t border-gray-100 pt-3 text-xs text-gray-400'>
          {contact.notes}
        </p>
      )}
    </div>
  );
});
