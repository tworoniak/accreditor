import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
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

export function StatCard({ label, value, icon, color, sub }: StatCardProps) {
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
