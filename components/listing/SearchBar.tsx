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
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        enterKeyHint="search"
        autoComplete="off"
        className="tap-target h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-14 text-sm text-gray-950 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50 dark:focus:ring-teal-950"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="tap-target absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
