'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LoginPageClientProps {
  initialError?: string;
}

export default function LoginPageClient({ initialError }: LoginPageClientProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN!;
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!;

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
        redirectTo: `${redirectOrigin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleOTPSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.toLowerCase().endsWith(`@${DOMAIN}`)) {
      setError(`Only @${DOMAIN} email addresses allowed here`);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{APP_NAME}</h1>
          <p className="text-gray-400 text-sm mt-1">Buy and sell within your college</p>
        </div>

        {initialError && !error && (
          <p className="text-sm text-red-500 text-center">
            {initialError === 'auth_failed'
              ? 'Google sign-in failed. Please try again.'
              : decodeURIComponent(initialError)}
          </p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full h-11 flex items-center justify-center gap-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
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
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {!showOTP ? (
          <button
            onClick={() => setShowOTP(true)}
            className="w-full h-11 flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            Sign in with CUMail (get verified badge)
          </button>
        ) : (
          <form onSubmit={handleOTPSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                CUMail address
                <span className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  Gets verified badge
                </span>
              </label>
              <input
                type="email"
                placeholder={`you@${DOMAIN}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setError('');
                }}
                className="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex-1 h-10 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending…' : 'Send code'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400">
          Google users can verify their student status later from profile settings
        </p>
      </div>
    </div>
  );
}
