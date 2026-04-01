import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AccreditationStatus } from '../types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
}

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
