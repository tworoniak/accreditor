import { memo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useShows } from '@/hooks/useShows';
import {
  useRequestsByShow,
  useUpdateRequestStatus,
  useUpdateRequest,
} from '@/hooks/useRequests';
import { Modal } from '@/components/ui/Modal';
import { RequestForm } from './RequestForm';
import { cn, formatDate, daysUntil, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';
import type {
  AccreditationRequest,
  AccreditationStatus,
} from '@/types/database';

const STATUSES: AccreditationStatus[] = [
  'upcoming',
  'drafted',
  'submitted',
  'awaiting_response',
  'granted',
  'rejected',
  'waitlisted',
  'shot',
  'no_show',
];

export function ShowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: shows = [] } = useShows();
  const { data: requests = [], isLoading } = useRequestsByShow(id!);
  const updateStatus = useUpdateRequestStatus();
  const updateRequest = useUpdateRequest();

  const [addOpen, setAddOpen] = useState(false);
  const [editingRestrictions, setEditingRestrictions] = useState<string | null>(
    null,
  );
  const [restrictionText, setRestrictionText] = useState('');
  const [editingGallery, setEditingGallery] = useState<string | null>(null);
  const [galleryText, setGalleryText] = useState('');
  const [mutationError, setMutationError] = useState<string | null>(null);

  const show = shows.find((s) => s.id === id);

  if (!show) {
    return (
      <div className='flex h-full items-center justify-center text-sm text-gray-400'>
        Show not found
      </div>
    );
  }

  function openRestrictions(req: AccreditationRequest) {
    setRestrictionText(req.pit_restrictions ?? '');
    setEditingRestrictions(req.id);
  }

  function openGallery(req: AccreditationRequest) {
    setGalleryText(req.gallery_url ?? '');
    setEditingGallery(req.id);
  }

  async function saveRestrictions() {
    if (!editingRestrictions) return;
    try {
      await updateRequest.mutateAsync({
        id: editingRestrictions,
        pit_restrictions: restrictionText || null,
      });
      setEditingRestrictions(null);
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : 'Failed to save restrictions');
    }
  }

  async function saveGallery() {
    if (!editingGallery) return;
    try {
      await updateRequest.mutateAsync({
        id: editingGallery,
        gallery_url: galleryText || null,
      });
      setEditingGallery(null);
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : 'Failed to save gallery link');
    }
  }

  return (
    <div className='p-8 dark:bg-gray-950 min-h-full'>
      <button
        onClick={() => navigate('/shows')}
        className='mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to shows
      </button>

      <div className='mb-8 flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
            {show.artist}
          </h1>
          <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
            <span className='flex items-center gap-1.5'>
              <MapPin className='h-4 w-4' />
              {show.venue}, {show.city}
            </span>
            <span className='flex items-center gap-1.5'>
              <Calendar className='h-4 w-4' />
              {formatDate(show.show_date)}
            </span>
            {show.promoter && (
              <span className='text-gray-400 dark:text-gray-500'>Promoter: {show.promoter}</span>
            )}
            {show.tour_name && (
              <span className='text-gray-400 dark:text-gray-500'>{show.tour_name}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
        >
          <Plus className='h-4 w-4' />
          Add request
        </button>
      </div>

      {mutationError && (
        <div className='mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400'>
          {mutationError}
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center py-16 text-sm text-gray-400'>
          Loading
        </div>
      ) : requests.length === 0 ? (
        <div className='rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500'>
          No accreditation requests yet for this show
        </div>
      ) : (
        <div className='space-y-3'>
          {requests.map((req) => (
            <RequestRow
              key={req.id}
              request={req}
              onStatusChange={(status) =>
                updateStatus.mutate({ id: req.id, status }, { onError: (e) => setMutationError(e instanceof Error ? e.message : 'Failed to update status') })
              }
              onEditRestrictions={() => openRestrictions(req)}
              onEditGallery={() => openGallery(req)}
            />
          ))}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title='New accreditation request'
      >
        <RequestForm showId={show.id} onSuccess={() => setAddOpen(false)} />
      </Modal>

      <Modal
        open={!!editingRestrictions}
        onClose={() => setEditingRestrictions(null)}
        title='Pit restrictions'
      >
        <div className='space-y-4'>
          <textarea
            value={restrictionText}
            onChange={(e) => setRestrictionText(e.target.value)}
            rows={4}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-500/20'
            placeholder='First 3 songs only, no flash, no 70-200mm'
          />
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setEditingRestrictions(null)}
              className='rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              onClick={saveRestrictions}
              className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editingGallery}
        onClose={() => setEditingGallery(null)}
        title='Gallery link'
      >
        <div className='space-y-4'>
          <input
            type='url'
            value={galleryText}
            onChange={(e) => setGalleryText(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-500/20'
            placeholder='https://cloudinary.com/ or https://dropbox.com/'
          />
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setEditingGallery(null)}
              className='rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              onClick={saveGallery}
              className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface RowProps {
  request: AccreditationRequest;
  onStatusChange: (status: AccreditationStatus) => void;
  onEditRestrictions: () => void;
  onEditGallery: () => void;
}

const RequestRow = memo(function RequestRow({
  request,
  onStatusChange,
  onEditRestrictions,
  onEditGallery,
}: RowProps) {
  const deadline = request.submission_deadline;
  const days = deadline ? daysUntil(deadline) : null;
  const isUrgent = days !== null && days <= 3 && days >= 0;
  const isOverdue = days !== null && days < 0;

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1.5'>
          {request.pr_contact ? (
            <div className='flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200'>
              <User className='h-4 w-4 text-gray-400 dark:text-gray-500' />
              {request.pr_contact.name}
              {request.pr_contact.company && (
                <span className='font-normal text-gray-400 dark:text-gray-500'>
                  {' '}
                  - {request.pr_contact.company}
                </span>
              )}
            </div>
          ) : (
            <span className='text-sm text-gray-400 dark:text-gray-500'>
              No PR contact assigned
            </span>
          )}

          {request.photographer && (
            <div className='flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500'>
              <div className='flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600'>
                {request.photographer.full_name?.[0] ?? '?'}
              </div>
              {request.photographer.full_name}
            </div>
          )}

          {deadline && (
            <div
              className={
                'flex items-center gap-1 text-xs font-medium ' +
                (isOverdue
                  ? 'text-red-500'
                  : isUrgent
                    ? 'text-amber-600'
                    : 'text-gray-400')
              }
            >
              <AlertCircle className='h-3.5 w-3.5' />
              {isOverdue
                ? 'Deadline passed ' + Math.abs(days!) + 'd ago'
                : 'Deadline in ' + days + 'd - ' + formatDate(deadline)}
            </div>
          )}

          {request.notes && (
            <p className='text-xs text-gray-400 dark:text-gray-500'>{request.notes}</p>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button
            onClick={onEditRestrictions}
            className='rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
          >
            {request.pit_restrictions ? 'Restrictions' : '+ Restrictions'}
          </button>

          {request.gallery_url ? (
            <a
              href={request.gallery_url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:hover:bg-brand-900/20'
            >
              <ExternalLink className='h-3 w-3' />
              Gallery
            </a>
          ) : (
            <button
              onClick={onEditGallery}
              className='rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
            >
              + Gallery link
            </button>
          )}

          <div className='relative inline-flex items-center'>
            <select
              value={request.status}
              onChange={(e) =>
                onStatusChange(e.target.value as AccreditationStatus)
              }
              className={cn(
                'cursor-pointer appearance-none rounded-full px-2.5 py-0.5 pr-6 text-xs font-medium outline-none',
                STATUS_COLORS[request.status],
              )}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <ChevronDown className='pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60' />
          </div>
        </div>
      </div>

      {request.pit_restrictions && (
        <div
          className='mt-3 cursor-pointer rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30'
          onClick={onEditRestrictions}
        >
          <span className='font-medium'>Pit rules:</span>{' '}
          {request.pit_restrictions}
        </div>
      )}
    </div>
  );
});
