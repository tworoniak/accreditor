import { NavLink, Outlet } from 'react-router-dom';
import { Camera, Users, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shows', label: 'Shows', icon: Camera },
  { to: '/contacts', label: 'PR Contacts', icon: Users },
  { to: '/templates', label: 'Templates', icon: FileText },
];

export function AppShell() {
  const { profile, signOut } = useAuth();

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      {/* Sidebar */}
      <aside className='flex w-56 flex-col border-r border-gray-200 bg-white'>
        <div className='flex h-14 items-center gap-2 border-b border-gray-200 px-4'>
          <Camera className='h-5 w-5 text-brand-500' />
          <span className='text-sm font-semibold text-gray-900'>
            Accreditor
          </span>
        </div>

        <nav className='flex-1 space-y-0.5 p-2'>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              <Icon className='h-4 w-4' />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='border-t border-gray-200 p-3'>
          <div className='mb-2 px-2 text-xs text-gray-500'>
            {profile?.full_name ?? 'Photographer'}
          </div>
          <button
            onClick={signOut}
            className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <LogOut className='h-4 w-4' />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
}
