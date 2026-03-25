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
    <div className="space-y-4 rounded-[28px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)] md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
            <SlidersHorizontal size={16} />
            Filter and sort
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {typeof resultCount === 'number'
              ? `${resultCount} ${resultCount === 1 ? 'listing' : 'listings'} after filters`
              : 'Refine the feed with price and condition'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
          {primaryLocationLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              <MapPin size={12} />
              Your area: {primaryLocationLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-1">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Sort
          </span>
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value as ListingSortOption)}
            className="h-12 w-full rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4 text-sm text-gray-700 outline-none transition focus:border-orange-200 focus:ring-2 focus:ring-orange-200"
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Condition</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => update('condition', 'all')}
            className={`flex-shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
              filters.condition === 'all'
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/60'
            }`}
          >
            All conditions
          </button>
          {(Object.entries(CONDITION_LABELS) as [Condition, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => update('condition', filters.condition === value ? 'all' : value)}
              className={`flex-shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                filters.condition === value
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/60'
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
