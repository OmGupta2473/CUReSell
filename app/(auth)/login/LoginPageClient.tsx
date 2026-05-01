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
      <div className="glass-panel page-reveal grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.08] md:grid-cols-[1fr_0.9fr]">
        <section className="flex min-h-[32rem] flex-col justify-between bg-[linear-gradient(160deg,rgba(14,18,28,0.96),rgba(9,11,17,0.92))] p-6 text-white md:p-8">
          <Link href="/" className="text-lg font-black tracking-tight">
            CUReSell
          </Link>

          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-100">
              <ShieldCheck size={14} />
              Campus-only marketplace
            </div>
            <h1 className="max-w-md text-3xl font-black tracking-tight md:text-5xl">
              Sign in and get back to campus deals.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              Buy, sell, save listings, and chat with students from your campus network.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Student verification can be completed from your profile after login.
          </p>
        </section>

        <section className="flex flex-col justify-center p-6 md:p-8">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-200">
                Welcome
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                Continue to {APP_NAME}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use Google to sign in securely. Your CU verification badge is managed from your profile.
              </p>
            </div>

            {visibleError && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.12] p-3 text-sm font-semibold text-red-100">
                {visibleError === 'auth_failed'
                  ? 'Google sign-in failed. Please try again.'
                  : decodeURIComponent(visibleError)}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_40px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="h-4 w-4 animate-pulse rounded-full bg-white/[0.3]" />
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
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-white"
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
