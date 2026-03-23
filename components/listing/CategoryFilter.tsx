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
        className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          selected === null
            ? 'border-black bg-black text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        All
      </button>
      {ALL_CATEGORIES.map(([value, label]) => (
        <button
          key={value}
          onClick={() => onChange(selected === value ? null : value)}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            selected === value
              ? 'border-black bg-black text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <span className="text-base leading-none">{CATEGORY_ICONS[value]}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
