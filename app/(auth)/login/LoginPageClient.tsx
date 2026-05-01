'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface LoginPageClientProps {
  initialError?: string;
  nextPath?: string;
}

export default function LoginPageClient({ initialError, nextPath }: LoginPageClientProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!;
  const safeNextPath =
    nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/';

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');
    const redirectOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectOrigin}/api/auth/callback?next=${encodeURIComponent(safeNextPath)}`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  const visibleError = error || initialError;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_0.9fr]">
        <section className="flex min-h-[32rem] flex-col justify-between bg-gray-950 p-6 text-white md:p-8">
          <Link href="/" className="text-lg font-black tracking-tight">
            CUReSell
          </Link>

          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <ShieldCheck size={14} />
              Campus-only marketplace
            </div>
            <h1 className="max-w-md text-3xl font-black tracking-tight md:text-5xl">
              Sign in and get back to campus deals.
            </h1>
            <p className="max-w-md text-sm leading-6 text-gray-300">
              Buy, sell, save listings, and chat with students from your campus network.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Student verification can be completed from your profile after login.
          </p>
        </section>

        <section className="flex flex-col justify-center p-6 md:p-8">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Welcome
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 dark:text-white">
                Continue to {APP_NAME}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Use Google to sign in securely. Your CU verification badge is managed from your profile.
              </p>
            </div>

            {visibleError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {visibleError === 'auth_failed'
                  ? 'Google sign-in failed. Please try again.'
                  : decodeURIComponent(visibleError)}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 text-sm font-black text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              {googleLoading ? (
                <span className="h-4 w-4 animate-pulse rounded-full bg-gray-300" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Browse first
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
