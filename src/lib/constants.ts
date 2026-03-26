import type { AccreditationStatus } from '@/types/database';

export const STATUS_LABELS: Record<AccreditationStatus, string> = {
  upcoming: 'Upcoming',
  drafted: 'Drafted',
  submitted: 'Submitted',
  awaiting_response: 'Awaiting Response',
  granted: 'Granted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  shot: 'Shot',
  no_show: 'No Show',
};

export const STATUS_COLORS: Record<AccreditationStatus, string> = {
  upcoming: 'bg-gray-100 text-gray-600',
  drafted: 'bg-purple-100 text-purple-700',
  submitted: 'bg-blue-100 text-blue-700',
  awaiting_response: 'bg-amber-100 text-amber-700',
  granted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-orange-100 text-orange-700',
  shot: 'bg-green-100 text-green-700',
  no_show: 'bg-gray-100 text-gray-400',
};
