'use client';

import { MapPin, SlidersHorizontal } from 'lucide-react';
import { CONDITION_LABELS, type Condition } from '@/lib/types';
import {
  SORT_LABELS,
  type ListingFeedFilters,
  type ListingSortOption,
} from '@/lib/utils/listingFeed';

interface FeedControlsProps {
  filters: ListingFeedFilters;
  onChange: (filters: ListingFeedFilters) => void;
  hostelOptions: string[];
  departmentOptions: string[];
  resultCount?: number;
  activeFilterCount?: number;
  primaryLocationLabel?: string | null;
}

export function FeedControls({
  filters,
  onChange,
  hostelOptions,
  departmentOptions,
  resultCount,
  activeFilterCount = 0,
  primaryLocationLabel,
}: FeedControlsProps) {
  function update<K extends keyof ListingFeedFilters>(key: K, value: ListingFeedFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black text-gray-950 dark:text-white">
            <SlidersHorizontal size={16} />
            Filter and sort
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {typeof resultCount === 'number'
              ? `${resultCount} ${resultCount === 1 ? 'listing' : 'listings'} after filters`
              : 'Refine the feed with price and condition'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {activeFilterCount > 0 && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
          {primaryLocationLabel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 font-bold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <MapPin size={12} />
              Your area: {primaryLocationLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-1">
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
            Sort
          </span>
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value as ListingSortOption)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-teal-950"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p id="condition-filter-label" className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Condition
        </p>
        <div
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
          role="group"
          aria-labelledby="condition-filter-label"
        >
          <button
            type="button"
            onClick={() => update('condition', 'all')}
            aria-pressed={filters.condition === 'all'}
            className={`tap-target flex-shrink-0 snap-start rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors ${
              filters.condition === 'all'
                ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            All conditions
          </button>
          {(Object.entries(CONDITION_LABELS) as [Condition, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => update('condition', filters.condition === value ? 'all' : value)}
              aria-pressed={filters.condition === value}
              className={`tap-target flex-shrink-0 snap-start rounded-lg border px-3.5 py-2 text-sm font-bold transition-colors ${
                filters.condition === value
                  ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
