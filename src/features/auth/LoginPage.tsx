import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200'>
        <h1 className='mb-1 text-xl font-semibold text-gray-900'>Accreditor</h1>
        <p className='mb-6 text-sm text-gray-500'>Antihero Magazine</p>

        {sent ? (
          <p className='text-sm text-gray-600'>
            Magic link sent — check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Email
              </label>
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                placeholder='you@antiheromag.com'
              />
            </div>
            <button
              type='submit'
              disabled={loading}
              className='w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50'
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
