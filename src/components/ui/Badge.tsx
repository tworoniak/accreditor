import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import type { AccreditationStatus } from '@/types/database';

interface BadgeProps {
  status: AccreditationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
