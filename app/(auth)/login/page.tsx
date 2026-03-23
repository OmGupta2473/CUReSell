'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN!;
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.toLowerCase().endsWith(`@${DOMAIN}`)) {
      setError(`Only @${DOMAIN} email addresses are allowed`);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(`/verify?email=${encodeURIComponent(email.toLowerCase())}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-gray-500">Buy and sell within your college</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">College email</label>
            <input
              type="email"
              placeholder={`you@${DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="h-10 w-full rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending code…' : 'Send login code'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          We&apos;ll send a 6-digit code to your college email. No password needed.
        </p>
      </div>
    </div>
  );
}
