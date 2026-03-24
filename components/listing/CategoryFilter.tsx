'use client';

import { CATEGORY_LABELS, type Category } from '@/lib/types';

interface CategoryFilterProps {
  selected: Category | null;
  onChange: (category: Category | null) => void;
}

const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

const CATEGORY_ICONS: Record<Category, string> = {
  books: '📚',
  electronics: '💻',
  furniture: '🪑',
  kitchen: '🍳',
  clothes: '👕',
  cycles: '🚲',
  sports: '⚽',
  other: '📦',
};

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
          selected === null
            ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
            : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/60'
        }`}
      >
        All
      </button>
      {ALL_CATEGORIES.map(([value, label]) => (
        <button
          key={value}
          onClick={() => onChange(selected === value ? null : value)}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
            selected === value
              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/60'
          }`}
        >
          <span className="text-base leading-none">{CATEGORY_ICONS[value]}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
