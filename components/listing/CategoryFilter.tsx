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
      className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
      role="group"
      aria-label="Category filters"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
        className={cn(
          'tap-target flex-shrink-0 snap-start rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors',
          selected === null
            ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
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
            'tap-target flex flex-shrink-0 snap-start items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors',
            selected === value
              ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
