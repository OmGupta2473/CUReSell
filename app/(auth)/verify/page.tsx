'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function VerifyPageContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const supabase = createClient();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) {
      setError('Invalid or expired code. Try again.');
      setLoading(false);
      return;
    }
    router.push('/');
    router.refresh();
  }

  async function handleResend() {
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setResent(true);
    setTimeout(() => setResent(false), 30000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <span className="text-xl">📧</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
          <p className="mt-1 text-sm text-gray-500">
            We sent a 6-digit code to
            <br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-10 rounded-lg border border-gray-200 text-center text-lg font-semibold focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              />
            ))}
          </div>
          {error && <p className="text-center text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="h-10 w-full rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify code'}
          </button>
        </form>
        <div className="space-y-2 text-center">
          <button
            onClick={handleResend}
            disabled={resent}
            className="text-sm text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resent ? 'Code sent! Check your inbox.' : 'Didn&apos;t get a code? Resend'}
          </button>
          <br />
          <button onClick={() => router.push('/login')} className="text-xs text-gray-400 hover:underline">
            Wrong email? Go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyPageContent />
    </Suspense>
  );
}
