import { STATUS_LABELS } from '@/lib/utils';
import type { AccreditationStatus } from '@/types/database';

const STATUS_ORDER: AccreditationStatus[] = [
  'shot',
  'granted',
  'submitted',
  'awaiting_response',
  'drafted',
  'upcoming',
  'waitlisted',
  'rejected',
  'no_show',
];

function getStatusBarColor(status: AccreditationStatus): string {
  const map: Partial<Record<AccreditationStatus, string>> = {
    shot: '#059669',
    granted: '#10b981',
    submitted: '#3b82f6',
    awaiting_response: '#f59e0b',
    drafted: '#8b5cf6',
    upcoming: '#9ca3af',
    waitlisted: '#f97316',
    rejected: '#ef4444',
    no_show: '#d1d5db',
  };
  return map[status] ?? '#9ca3af';
}

interface StatusBreakdownProps {
  byStatus: Record<AccreditationStatus, number>;
  total: number;
}

export function StatusBreakdown({ byStatus, total }: StatusBreakdownProps) {
  if (total === 0) {
    return <p className='text-xs text-gray-400'>No requests yet</p>;
  }

  return (
    <div className='space-y-2.5'>
      {STATUS_ORDER.filter((s) => (byStatus[s] ?? 0) > 0).map((status) => {
        const count = byStatus[status] ?? 0;
        const pct = Math.round((count / total) * 100);

        return (
          <div key={status}>
            <div className='mb-1 flex items-center justify-between'>
              <span className='text-xs text-gray-600 dark:text-gray-400'>
                {STATUS_LABELS[status]}
              </span>
              <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>{count}</span>
            </div>
            <div className='h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
              <div
                className='h-full rounded-full transition-all duration-500'
                style={{
                  width: `${pct}%`,
                  backgroundColor: getStatusBarColor(status),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
