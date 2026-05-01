'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    if (email && !email.endsWith('@cuchd.in')) {
      setEmailError('Only Chandigarh University email addresses are allowed.');
    }
    inputRefs.current[0]?.focus();
  }, [email]);

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

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp[index] && index === 7 && newOtp.every((digit) => digit !== '')) {
      verifyOtp(newOtp);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
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

      const lastIndex = Math.min(digits.length - 1, 7);
      inputRefs.current[lastIndex]?.focus();

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

      if (data.user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_cu_verified: true })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Failed to update verification status:', updateError);
        }
      }

      const safeNextPath =
        nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/';
      router.push(safeNextPath);
      router.refresh();
    } catch {
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-panel w-full max-w-sm rounded-[1.75rem] border border-red-400/20 p-6 text-center">
          <ShieldCheck className="mx-auto text-red-500" size={34} />
          <h1 className="mt-4 text-xl font-black text-white">Email not allowed</h1>
          <p className="mt-2 text-sm leading-6 text-red-200">{emailError}</p>
          <p className="mt-2 text-xs text-slate-400">
            Please use your Chandigarh University email address ending with @cuchd.in.
          </p>
          <Button onClick={() => router.push('/login')} variant="primary" className="mt-5 w-full">
            Go back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel page-reveal w-full max-w-md rounded-[1.9rem] p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.08] text-sky-100">
            <MailCheck size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
            Check your email
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            We sent an 8-digit verification code to
            <br />
            <span className="font-bold text-slate-100">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
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
                aria-label={`Verification digit ${i + 1}`}
                className={`h-12 rounded-lg border text-center text-xl font-black transition-all ${
                  digit
                    ? 'border-sky-300/20 bg-sky-400/[0.16] text-white'
                    : 'border-white/[0.1] bg-white/[0.05] text-white'
                } ${loading ? 'cursor-not-allowed opacity-50' : 'focus:border-[rgb(var(--focus))]/60 focus:outline-none focus:ring-4 focus:ring-[rgb(var(--focus))]/10'}`}
              />
            ))}
          </div>

          {error && <p className="text-center text-sm font-semibold text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading || otp.join('').length < 8}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {loading ? 'Verifying...' : otp.join('').length === 8 ? 'Verify code' : `Enter code (${otp.filter((d) => d).length}/8)`}
          </Button>
        </form>

        <div className="mt-5 space-y-3 border-t border-white/[0.08] pt-4 text-center">
          <button
            onClick={handleResend}
            disabled={loading || resentCooldown > 0 || resent}
            className="text-sm font-bold text-slate-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resentCooldown > 0
              ? `Resend code in ${resentCooldown}s`
              : resent
                ? 'Code sent. Check your inbox.'
                : "Didn't get a code? Resend"}
          </button>

          <button
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent(nextPath || '/')}`)
            }
            disabled={loading}
            className="block w-full text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300 disabled:cursor-not-allowed"
          >
            Wrong email? Go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[rgb(var(--background))]" />}>
      <VerifyPageContent />
    </Suspense>
  );
}
