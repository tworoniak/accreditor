import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/AuthContext'
import { AuthGuard } from '@/features/auth/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'

// Placeholder pages — we'll build these next
const Dashboard  = () => <div className="p-8 text-gray-500">Dashboard coming soon</div>
const Shows      = () => <div className="p-8 text-gray-500">Shows coming soon</div>
const Contacts   = () => <div className="p-8 text-gray-500">Contacts coming soon</div>
const Templates  = () => <div className="p-8 text-gray-500">Templates coming soon</div>

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/shows"     element={<Shows />} />
                <Route path="/contacts"  element={<Contacts />} />
                <Route path="/templates" element={<Templates />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

### `.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key