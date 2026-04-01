import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { ShowsPage } from '@/features/shows/ShowsPage';
import { ShowDetailPage } from '@/features/shows/ShowDetailPage';
import { ContactsPage } from '@/features/contacts/ContactsPage';
import { TemplatesPage } from '@/features/templates/TemplatesPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route path='/' element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path='/shows' element={<ErrorBoundary><ShowsPage /></ErrorBoundary>} />
                <Route path='/shows/:id' element={<ErrorBoundary><ShowDetailPage /></ErrorBoundary>} />
                <Route path='/contacts' element={<ErrorBoundary><ContactsPage /></ErrorBoundary>} />
                <Route path='/templates' element={<ErrorBoundary><TemplatesPage /></ErrorBoundary>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
