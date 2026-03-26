import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
// import { PipelinePage } from '@/features/requests/PipelinePage';
import { ShowsPage } from '@/features/shows/ShowsPage';
import { ShowDetailPage } from '@/features/shows/ShowDetailPage';
import { ContactsPage } from '@/features/contacts/ContactsPage';
import { TemplatesPage } from '@/features/templates/TemplatesPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                {/* <Route path='/' element={<PipelinePage />} /> */}
                <Route path='/' element={<DashboardPage />} />
                <Route path='/shows' element={<ShowsPage />} />
                <Route path='/shows/:id' element={<ShowDetailPage />} />
                <Route path='/contacts' element={<ContactsPage />} />
                <Route path='/templates' element={<TemplatesPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
