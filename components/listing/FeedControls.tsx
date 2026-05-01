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
    <div className="glass-panel-muted space-y-4 rounded-[1.4rem] p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black text-white">
            <SlidersHorizontal size={16} />
            Filter and sort
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {typeof resultCount === 'number'
              ? `${resultCount} ${resultCount === 1 ? 'listing' : 'listings'} after filters`
              : 'Refine the feed with price and condition'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {activeFilterCount > 0 && (
            <span className="rounded-full border border-sky-300/20 bg-sky-400/[0.12] px-3 py-1 font-bold text-sky-100">
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
          {primaryLocationLabel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 font-bold text-slate-300">
              <MapPin size={12} />
              Your area: {primaryLocationLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-1">
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Sort
          </span>
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value as ListingSortOption)}
            className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 text-sm font-medium text-slate-100 outline-none focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
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
        <p id="condition-filter-label" className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Condition
        </p>
        <div
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide premium-scrollbar"
          role="group"
          aria-labelledby="condition-filter-label"
        >
          <button
            type="button"
            onClick={() => update('condition', 'all')}
            aria-pressed={filters.condition === 'all'}
            className={`tap-target flex-shrink-0 snap-start rounded-xl border px-3.5 py-2 text-sm font-bold transition-all ${
              filters.condition === 'all'
                ? 'border-sky-300/20 bg-sky-400/[0.16] text-sky-100 shadow-[0_14px_28px_rgba(88,161,255,0.18)]'
                : 'border-white/[0.08] bg-white/[0.05] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white'
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
              className={`tap-target flex-shrink-0 snap-start rounded-xl border px-3.5 py-2 text-sm font-bold transition-all ${
                filters.condition === value
                  ? 'border-sky-300/20 bg-sky-400/[0.16] text-sky-100 shadow-[0_14px_28px_rgba(88,161,255,0.18)]'
                  : 'border-white/[0.08] bg-white/[0.05] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white'
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
