'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Edit2, LogOut, MailCheck, MapPin, ShieldCheck, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserListings } from '@/components/profile/UserListings';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { Profile, Listing } from '@/lib/types';

interface ProfileViewProps {
  profile: Profile | null;
  listings: Listing[];
  isOwnProfile: boolean;
}

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'MBA', 'MCA', 'BCA', 'BBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Alumni'];

export function ProfileView({ profile, listings, isOwnProfile }: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [hostel, setHostel] = useState(profile?.hostel_block ?? '');
  const [year, setYear] = useState(profile?.year_of_study ?? '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const activeListings = listings.filter((l) => l.status === 'active');
  const soldListings = listings.filter((l) => l.status === 'sold');
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';

  async function handleSave() {
    if (!profile || !name.trim()) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        full_name: name.trim(),
        department: department || null,
        hostel_block: hostel.trim() || null,
        year_of_study: year || null,
      })
      .eq('id', profile.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="glass-panel overflow-hidden rounded-[1.8rem]">
        <div className="h-28 bg-[linear-gradient(135deg,rgba(122,182,255,0.92),rgba(94,234,212,0.55),rgba(17,24,39,0.3))]" />
        <div className="p-5 md:p-6">
          <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.4rem] border-4 border-[rgb(var(--background))] bg-white/[0.08] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-slate-200">
                    {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-2">
                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="max-w-xs font-bold"
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-black tracking-tight text-white">
                      {profile?.full_name}
                    </h1>
                    {profile?.is_cu_verified && <VerifiedBadge size="sm" showLabel />}
                  </div>
                )}
                <p className="text-sm text-slate-400">{profile?.email}</p>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving} variant="primary">
                      <Check size={16} />
                      {saving ? 'Saving' : 'Save'}
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      <X size={16} />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setEditing(true)}>
                      <Edit2 size={16} />
                      Edit
                    </Button>
                    <Button onClick={handleSignOut} variant="ghost">
                      <LogOut size={16} />
                      Sign out
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Department
                </span>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm text-slate-100 outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Year of study
                </span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm text-slate-100 outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
                >
                  <option value="">Select year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Hostel / Block
                </span>
                <Input
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  placeholder="e.g. Block C, Girls Hostel"
                />
              </label>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {profile?.department && <ProfilePill>{profile.department}</ProfilePill>}
              {profile?.year_of_study && <ProfilePill>{profile.year_of_study}</ProfilePill>}
              {profile?.hostel_block && (
                <ProfilePill>
                  <MapPin size={13} />
                  {profile.hostel_block}
                </ProfilePill>
              )}
              {!profile?.department &&
                !profile?.year_of_study &&
                !profile?.hostel_block &&
                isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-xl border border-dashed border-white/[0.12] px-3 py-2 text-sm font-bold text-slate-400 transition-colors hover:border-white/[0.2] hover:text-white"
                  >
                    Add department and hostel
                  </button>
                )}
            </div>
          )}

          <div className="mt-6 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-3">
            <ProfileStat label="Active" value={activeListings.length} />
            <ProfileStat label="Sold" value={soldListings.length} />
            <ProfileStat label="Total listings" value={listings.length} />
          </div>

          {isOwnProfile && (
            <div className="mt-5 border-t border-white/[0.08] pt-5">
              {profile?.is_cu_verified ? (
                <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-sky-300/20 bg-sky-400/[0.12] p-3 text-sm text-sky-100">
                  <VerifiedBadge size="md" showLabel />
                  <span className="text-xs font-medium">{profile.cu_email}</span>
                </div>
              ) : (
                <VerifyWithCUMail userId={profile?.id ?? ''} />
              )}
            </div>
          )}
        </div>
      </section>

      <UserListings
        listings={listings}
        title={isOwnProfile ? 'My listings' : `${firstName}'s listings`}
        allowFiltering={isOwnProfile}
      />
    </div>
  );
}

function ProfilePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm font-bold text-slate-300">
      {children}
    </span>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel-muted rounded-[1.2rem] p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}

function VerifyWithCUMail({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN!;
  const router = useRouter();

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    const cuEmailLower = email.toLowerCase();
    if (!cuEmailLower.endsWith(`@${DOMAIN}`)) {
      setError(`Must be a @${DOMAIN} address`);
      return;
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, is_cu_verified')
      .eq('cu_email', cuEmailLower)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.id !== userId) {
        setError('This CU email is already registered to another account');
        return;
      }
      if (existingProfile.is_cu_verified) {
        setError('Your account is already verified with this email');
        return;
      }
    }

    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: cuEmailLower,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setStep('otp');
    setLoading(false);
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const cuEmailLower = email.toLowerCase();

    const { error: otpError } = await supabase.auth.verifyOtp({
      email: cuEmailLower,
      token: otp.trim(),
      type: 'email',
    });
    if (otpError) {
      setError('Invalid code. Try again.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_cu_verified: true,
        cu_email: cuEmailLower,
      })
      .eq('id', userId);

    if (updateError) {
      setError('Verification failed. Try again.');
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.refresh(), 1500);
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-[1.2rem] border border-sky-300/20 bg-sky-400/[0.12] p-3 text-sm font-bold text-sky-100">
        <Check size={16} />
        CU Verified. Refreshing...
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="glass-panel-muted flex w-full items-center gap-3 rounded-[1.3rem] border border-dashed border-sky-300/20 p-4 text-left transition-all hover:border-sky-300/30 hover:bg-sky-400/[0.08]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-sky-100 shadow-sm">
          <ShieldCheck size={20} />
        </span>
        <span>
          <span className="block text-sm font-black text-white">
            Verify as a CU student
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-400">
            Use your CUMail to show a verified badge on your profile and listings.
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="glass-panel-muted space-y-3 rounded-[1.3rem] p-4">
      <div className="flex items-start gap-3">
        <MailCheck className="mt-0.5 text-sky-100" size={18} />
        <div>
          <p className="text-sm font-black text-white">Verify with your CUMail</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Enter your college email and confirm the code sent to your inbox.
          </p>
        </div>
      </div>

      {step === 'input' ? (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`you@${DOMAIN}`}
            className="text-sm"
          />
          <Button type="submit" disabled={loading || !email} variant="primary">
            {loading ? 'Sending...' : 'Send code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="8-digit code"
            className="text-sm"
          />
          <Button type="submit" disabled={loading || otp.length < 8} variant="primary">
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      )}
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
