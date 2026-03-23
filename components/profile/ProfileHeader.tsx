'use client';

import { useState } from 'react';
import { LogOut, PencilLine, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
  totalListings?: number;
  soldCount?: number;
}

export function ProfileHeader({
  profile,
  isOwnProfile = false,
  totalListings = 0,
  soldCount = 0,
}: ProfileHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    department: profile.department ?? '',
    hostel_block: profile.hostel_block ?? '',
    year_of_study: profile.year_of_study ?? '',
  });
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        department: form.department.trim() || null,
        hostel_block: form.hostel_block.trim() || null,
        year_of_study: form.year_of_study.trim() || null,
      })
      .eq('id', profile.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const chips = [profile.department, profile.hostel_block, profile.year_of_study].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
      <div className="bg-gradient-to-r from-orange-100 via-amber-50 to-white px-5 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
              {profile.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{profile.full_name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2">
              <button
                onClick={() => (editing ? void handleSave() : setEditing(true))}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
              >
                {editing ? <Save size={15} /> : <PencilLine size={15} />}
                {saving ? 'Saving...' : editing ? 'Save' : 'Edit profile'}
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.length > 0 ? (
            chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {chip}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-gray-500">
              Campus profile
            </span>
          )}
        </div>
      </div>

      {editing ? (
        <div className="grid gap-3 border-t border-gray-100 p-5 sm:grid-cols-2">
          <input
            value={form.full_name}
            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
            className="h-11 rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
            placeholder="Full name"
          />
          <input
            value={form.department}
            onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
            className="h-11 rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
            placeholder="Department"
          />
          <input
            value={form.hostel_block}
            onChange={(e) => setForm((prev) => ({ ...prev, hostel_block: e.target.value }))}
            className="h-11 rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
            placeholder="Hostel block"
          />
          <input
            value={form.year_of_study}
            onChange={(e) => setForm((prev) => ({ ...prev, year_of_study: e.target.value }))}
            className="h-11 rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
            placeholder="Year of study"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px border-t border-gray-100 bg-gray-100">
          <div className="bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Listings</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{totalListings}</p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Sold</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{soldCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
