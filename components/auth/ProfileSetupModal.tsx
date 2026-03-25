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
    <div
      style={{
        minHeight: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Complete your profile</h2>
          <p className="text-sm text-gray-400 mt-1">Logged in as {email}</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              autoFocus
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
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
            <label className="text-sm font-medium text-gray-700">Year of study</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
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
            <label className="text-sm font-medium text-gray-700">Hostel / Block</label>
            <input
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              placeholder="e.g. Block C, Girls Hostel"
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Start using CUReSell'}
          </button>
        </form>
      </div>
    </div>
  );
}
