'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileSetupModalProps {
  userId: string;
  email: string;
}

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'MBA', 'MCA', 'BCA', 'BBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Alumni'];

export function ProfileSetupModal({ userId, email }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [hostel, setHostel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name.trim(),
        department: department || null,
        year_of_study: year || null,
        hostel_block: hostel.trim() || null,
      })
      .eq('id', userId);
    if (error) {
      setError('Failed to save. Please try again.');
      setSaving(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/45 p-4 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-sm rounded-[1.75rem] p-6 text-white">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Complete your profile</h2>
          <p className="mt-1 text-sm text-slate-400">Logged in as {email}</p>
        </div>
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              autoFocus
              className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm text-white outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm text-white outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">Year of study</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm text-white outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
            >
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">Hostel / Block</label>
            <input
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              placeholder="e.g. Block C, Girls Hostel"
              className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm text-white outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-2xl bg-[linear-gradient(180deg,rgba(138,194,255,0.98),rgba(88,161,255,0.94))] font-medium text-slate-950 shadow-[0_18px_40px_rgba(88,161,255,0.32)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Start using CUReSell'}
          </button>
        </form>
      </div>
    </div>
  );
}
