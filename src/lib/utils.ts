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

export function buildMailtoLink(
  email: string,
  subject: string | null,
  body: string,
  vars: Record<string, string>,
): string {
  const fill = (tmpl: string) =>
    tmpl.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
  const parts: string[] = [];
  if (subject) parts.push('subject=' + encodeURIComponent(fill(subject)));
  parts.push('body=' + encodeURIComponent(fill(body)));
  return 'mailto:' + encodeURIComponent(email) + '?' + parts.join('&');
}

export const STATUS_COLORS: Record<AccreditationStatus, string> = {
  upcoming: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  drafted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  awaiting_response: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  granted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  waitlisted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  shot: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  no_show: 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
};
