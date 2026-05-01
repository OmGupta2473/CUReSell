'use client';

import { CATEGORY_LABELS, type Category } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface CategoryFilterProps {
  selected: Category | null;
  onChange: (category: Category | null) => void;
}

const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div
      className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide premium-scrollbar"
      role="group"
      aria-label="Category filters"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
        className={cn(
          'tap-target flex-shrink-0 snap-start rounded-xl border px-3.5 py-2 text-sm font-bold transition-all',
          selected === null
            ? 'border-sky-300/20 bg-sky-400/[0.16] text-sky-100 shadow-[0_14px_28px_rgba(88,161,255,0.18)]'
            : 'border-white/[0.08] bg-white/[0.05] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white'
        )}
      >
        All
      </button>
      {ALL_CATEGORIES.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(selected === value ? null : value)}
          aria-pressed={selected === value}
          className={cn(
            'tap-target flex flex-shrink-0 snap-start items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all',
            selected === value
              ? 'border-sky-300/20 bg-sky-400/[0.16] text-sky-100 shadow-[0_14px_28px_rgba(88,161,255,0.18)]'
              : 'border-white/[0.08] bg-white/[0.05] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
