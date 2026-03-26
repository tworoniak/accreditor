import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  //   CheckCircle,
  Send,
  AlertCircle,
  ArrowRight,
  Camera,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/features/auth/useAuth';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, daysUntil, STATUS_LABELS } from '@/lib/utils';
import type { AccreditationStatus } from '@/types/database';

export function DashboardPage() {
  const { profile } = useAuth();
  const { stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();

  const greeting = getGreeting();

  if (isLoading || !stats) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='min-h-full bg-gray-50 p-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          {greeting}, {profile?.full_name?.split(' ')[0] ?? 'photographer'} 👋
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Here's what's happening with your accreditations
        </p>
      </div>

      {/* Stat cards */}
      <div className='mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label='Total requests'
          value={stats.totalRequests}
          icon={<Send className='h-5 w-5' />}
          color='blue'
        />
        <StatCard
          label='Approval rate'
          value={`${stats.approvalRate}%`}
          icon={<TrendingUp className='h-5 w-5' />}
          color='green'
          sub='of decided requests'
        />
        <StatCard
          label='Pending'
          value={stats.pendingCount}
          icon={<Clock className='h-5 w-5' />}
          color='amber'
          sub='awaiting outcome'
        />
        <StatCard
          label='Shots delivered'
          value={stats.byStatus.shot ?? 0}
          icon={<Camera className='h-5 w-5' />}
          color='purple'
        />
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left col: chart + top contacts */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Monthly bar chart */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <h2 className='mb-4 text-sm font-semibold text-gray-700'>
              Activity — last 6 months
            </h2>
            <BarChart data={stats.byMonth} />
            <div className='mt-3 flex items-center gap-4'>
              {[
                { label: 'Granted', color: 'bg-emerald-400' },
                { label: 'Rejected', color: 'bg-red-400' },
                { label: 'Submitted', color: 'bg-blue-300' },
              ].map(({ label, color }) => (
                <div key={label} className='flex items-center gap-1.5'>
                  <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                  <span className='text-xs text-gray-500'>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <h2 className='mb-4 text-sm font-semibold text-gray-700'>
              Breakdown by status
            </h2>
            <StatusBreakdown
              byStatus={stats.byStatus}
              total={stats.totalRequests}
            />
          </div>

          {/* Top contacts */}
          {stats.topContacts.length > 0 && (
            <div className='rounded-2xl border border-gray-200 bg-white p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-gray-700'>
                  Top PR contacts
                </h2>
                <button
                  onClick={() => navigate('/contacts')}
                  className='flex items-center gap-1 text-xs text-brand-500 hover:underline'
                >
                  View all <ArrowRight className='h-3 w-3' />
                </button>
              </div>
              <div className='space-y-3'>
                {stats.topContacts.map((c) => (
                  <div
                    key={c.name}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='text-sm font-medium text-gray-800'>
                        {c.name}
                      </p>
                      {c.company && (
                        <p className='text-xs text-gray-400'>{c.company}</p>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-semibold text-gray-900'>
                        {c.total > 0
                          ? Math.round((c.granted / c.total) * 100)
                          : 0}
                        %
                      </p>
                      <p className='text-xs text-gray-400'>
                        {c.granted}/{c.total} approved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col: deadlines + activity */}
        <div className='space-y-6'>
          {/* Upcoming deadlines */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <div className='mb-4 flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-amber-500' />
              <h2 className='text-sm font-semibold text-gray-700'>
                Deadlines this week
              </h2>
            </div>
            {stats.upcomingDeadlines.length === 0 ? (
              <p className='text-xs text-gray-400'>
                No deadlines in the next 7 days
              </p>
            ) : (
              <div className='space-y-3'>
                {stats.upcomingDeadlines.map((req) => {
                  const days = daysUntil(req.submission_deadline!);
                  return (
                    <div
                      key={req.id}
                      className='cursor-pointer rounded-lg border border-gray-100 p-3 hover:bg-gray-50'
                      onClick={() => navigate(`/shows/${req.show_id}`)}
                    >
                      <p className='text-sm font-medium text-gray-800'>
                        {req.show?.artist}
                      </p>
                      <p className='text-xs text-gray-400'>{req.show?.venue}</p>
                      <div
                        className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                        ${days <= 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}
                      >
                        <Clock className='h-3 w-3' />
                        {days === 0 ? 'Due today' : `${days}d left`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-sm font-semibold text-gray-700'>
                Recent activity
              </h2>
              <button
                onClick={() => navigate('/')}
                className='flex items-center gap-1 text-xs text-brand-500 hover:underline'
              >
                Pipeline <ArrowRight className='h-3 w-3' />
              </button>
            </div>
            <div className='space-y-3'>
              {stats.recentActivity.map((req) => (
                <div
                  key={req.id}
                  className='flex cursor-pointer items-start justify-between gap-2 hover:opacity-80'
                  onClick={() => navigate(`/shows/${req.show_id}`)}
                >
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-gray-800'>
                      {req.show?.artist}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {formatDate(req.updated_at)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} className='shrink-0' />
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className='text-xs text-gray-400'>No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple';
  sub?: string;
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', val: 'text-blue-600' },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-500',
    val: 'text-emerald-600',
  },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-500', val: 'text-amber-600' },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    val: 'text-purple-600',
  },
};

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5'>
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${c.bg}`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <p className={`text-2xl font-semibold ${c.val}`}>{value}</p>
      <p className='mt-0.5 text-sm text-gray-500'>{label}</p>
      {sub && <p className='mt-0.5 text-xs text-gray-400'>{sub}</p>}
    </div>
  );
}

interface BarChartProps {
  data: {
    month: string;
    granted: number;
    rejected: number;
    submitted: number;
  }[];
}

function BarChart({ data }: BarChartProps) {
  const max = Math.max(
    ...data.map((d) => d.granted + d.rejected + d.submitted),
    1,
  );

  return (
    <div className='flex items-end gap-2' style={{ height: 120 }}>
      {data.map((d) => {
        const total = d.granted + d.rejected + d.submitted;
        const pct = (total / max) * 100;

        return (
          <div
            key={d.month}
            className='group flex flex-1 flex-col items-center gap-1'
          >
            <div
              className='relative w-full overflow-hidden rounded-t-md'
              style={{ height: `${Math.max(pct, 4)}%` }}
              title={`${d.month}: ${d.granted} granted, ${d.rejected} rejected, ${d.submitted} submitted`}
            >
              {/* Stacked bars: submitted (bottom) → rejected → granted (top) */}
              <div className='absolute bottom-0 left-0 right-0 flex flex-col-reverse overflow-hidden rounded-t-md'>
                {d.submitted > 0 && (
                  <div
                    className='w-full bg-blue-200'
                    style={{
                      height: `${(d.submitted / Math.max(total, 1)) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                )}
                {d.rejected > 0 && (
                  <div
                    className='w-full bg-red-400'
                    style={{
                      height: `${(d.rejected / Math.max(total, 1)) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                )}
                {d.granted > 0 && (
                  <div
                    className='w-full bg-emerald-400'
                    style={{
                      height: `${(d.granted / Math.max(total, 1)) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                )}
              </div>
            </div>
            <span className='text-xs text-gray-400'>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

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

interface StatusBreakdownProps {
  byStatus: Record<AccreditationStatus, number>;
  total: number;
}

function StatusBreakdown({ byStatus, total }: StatusBreakdownProps) {
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
              <span className='text-xs text-gray-600'>
                {STATUS_LABELS[status]}
              </span>
              <span className='text-xs font-medium text-gray-700'>{count}</span>
            </div>
            <div className='h-1.5 overflow-hidden rounded-full bg-gray-100'>
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
