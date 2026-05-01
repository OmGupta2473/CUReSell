'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search listings...',
  label = 'Search listings',
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        enterKeyHint="search"
        autoComplete="off"
        className="tap-target h-12 w-full rounded-2xl border border-white/[0.1] bg-white/[0.06] pl-11 pr-14 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.18)] outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="tap-target absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-white"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
