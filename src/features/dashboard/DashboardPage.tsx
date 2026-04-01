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
import { formatDate, daysUntil } from '@/lib/utils';
import { StatCard } from './StatCard';
import { BarChart } from './BarChart';
import { StatusBreakdown } from './StatusBreakdown';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

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
