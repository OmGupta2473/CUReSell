'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Edit2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ListingGrid } from '@/components/listing/ListingGrid';
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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={56} height={56} className="object-cover" />
              ) : (
                <span className="text-xl font-bold text-gray-500">
                  {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <div>
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-semibold text-base border-b border-gray-300 focus:outline-none focus:border-black w-40"
                  placeholder="Your name"
                />
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-semibold text-base">{profile?.full_name}</p>
                  {profile?.is_cu_verified && <VerifiedBadge size="sm" showLabel />}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{profile?.email}</p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="flex items-center gap-1">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit2 size={16} className="text-gray-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Year of study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Hostel / Block</label>
              <input
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                placeholder="e.g. Block C, Girls Hostel"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.department && (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                {profile.department}
              </span>
            )}
            {profile?.year_of_study && (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                {profile.year_of_study}
              </span>
            )}
            {profile?.hostel_block && (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                {profile.hostel_block}
              </span>
            )}
            {!profile?.department &&
              !profile?.year_of_study &&
              !profile?.hostel_block &&
              isOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  + Add your department and hostel
                </button>
              )}
          </div>
        )}

        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="text-center">
            <p className="font-semibold text-sm">{activeListings.length}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm">{soldListings.length}</p>
            <p className="text-xs text-gray-400">Sold</p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            {profile?.is_cu_verified ? (
              <div className="flex items-center gap-2">
                <VerifiedBadge size="md" showLabel />
                <span className="text-xs text-gray-400">{profile.cu_email}</span>
              </div>
            ) : (
              <VerifyWithCUMail userId={profile?.id ?? ''} />
            )}
          </div>
        )}

        {isOwnProfile && !editing && (
          <button
            onClick={handleSignOut}
            className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        )}
      </div>

      {listings.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {isOwnProfile ? 'My listings' : `${profile?.full_name?.split(' ')[0]}'s listings`}
          </h2>
          <ListingGrid listings={listings} />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No listings yet</p>
        </div>
      )}
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
    if (!email.toLowerCase().endsWith(`@${DOMAIN}`)) {
      setError(`Must be a @${DOMAIN} address`);
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
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
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
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
        cu_email: email.toLowerCase(),
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
      <div className="flex items-center gap-2 text-teal-600 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        CU Verified! Refreshing…
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Verify as CU student to get verified badge
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-600">Verify with your CUMail</p>
      {step === 'input' ? (
        <form onSubmit={handleSendOTP} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`you@${DOMAIN}`}
            className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="h-9 px-3 bg-black text-white text-xs rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            {loading ? '…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit code"
            className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="h-9 px-3 bg-black text-white text-xs rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            {loading ? '…' : 'Verify'}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
