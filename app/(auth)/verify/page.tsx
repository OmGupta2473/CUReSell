'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function VerifyPageContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resent, setResent] = useState(false);
  const [resentCooldown, setResentCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const nextPath = searchParams.get('next') || '/';
  const supabase = createClient();

  // Validate CU email on mount
  useEffect(() => {
    if (email && !email.endsWith('@cuchd.in')) {
      setEmailError('Only Chandigarh University email addresses are allowed.');
    }
    inputRefs.current[0]?.focus();
  }, [email]);

  // Handle resend cooldown
  useEffect(() => {
    if (resentCooldown > 0) {
      const timer = setTimeout(() => setResentCooldown(resentCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resentCooldown]);

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-move to next box
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 8 digits are filled
    if (newOtp[index] && index === 7 && newOtp.every((digit) => digit !== '')) {
      verifyOtp(newOtp);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    // Backspace: go to previous box
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 8);

    if (digits.length > 0) {
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 8) newOtp[i] = digit;
      });
      setOtp(newOtp);
      setError('');

      // Focus last filled box or next empty box
      const lastIndex = Math.min(digits.length - 1, 7);
      inputRefs.current[lastIndex]?.focus();

      // Auto-verify if all 8 digits are now filled
      if (newOtp.every((digit) => digit !== '')) {
        verifyOtp(newOtp);
      }
    }
  }

  async function verifyOtp(otpArray: string[]) {
    const token = otpArray.join('');
    if (token.length !== 8) return;
    if (!email.endsWith('@cuchd.in')) {
      setEmailError('Only Chandigarh University email addresses are allowed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify OTP with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (verifyError) {
        setError('Invalid or expired code. Try again.');
        setLoading(false);
        setOtp(['', '', '', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Update profile with is_cu_verified = true
      if (data.user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_cu_verified: true })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Failed to update verification status:', updateError);
          // Still proceed even if this fails - user is authenticated
        }
      }

      // Redirect
      const safeNextPath =
        nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/';
      router.push(safeNextPath);
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 8) return;
    await verifyOtp(otp);
  }

  async function handleResend() {
    setError('');
    if (!email.endsWith('@cuchd.in')) {
      setEmailError('Only Chandigarh University email addresses are allowed.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError(error.message || 'Failed to resend code.');
      return;
    }

    setResent(true);
    setResentCooldown(30);
    setTimeout(() => setResent(false), 30000);
  }

  if (emailError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl">❌</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Email Not Allowed</h1>
            <p className="mt-2 text-sm text-red-600">{emailError}</p>
            <p className="mt-3 text-xs text-gray-500">
              Please use your Chandigarh University email address (ending with @cuchd.in)
            </p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-11 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <span className="text-xl">📧</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent an 8-digit verification code to
            <br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          {/* Apple-style OTP input boxes */}
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
                onPaste={handlePaste}
                disabled={loading}
                placeholder="•"
                className={`h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold transition-all ${
                  digit
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                } ${
                  loading ? 'cursor-not-allowed opacity-50' : 'focus:border-black focus:outline-none'
                }`}
              />
            ))}
          </div>

          {error && <p className="text-center text-sm text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.join('').length < 8}
            className="h-11 w-full rounded-xl bg-black text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying…
              </span>
            ) : otp.join('').length === 8 ? (
              'Verify code'
            ) : (
              `Enter code (${otp.filter((d) => d).length}/8)`
            )}
          </button>
        </form>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <button
            onClick={handleResend}
            disabled={loading || resentCooldown > 0 || resent}
            className="w-full text-sm text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium"
          >
            {resentCooldown > 0
              ? `Resend code in ${resentCooldown}s`
              : resent
                ? 'Code sent! Check your inbox.'
                : "Didn't get a code? Resend"}
          </button>

          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent(nextPath || '/')}`)
            }
            disabled={loading}
            className="w-full text-xs text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Wrong email? Go back
          </button>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xs text-blue-700">
            ✓ CU email verification gives you a student badge on your profile
          </p>
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
