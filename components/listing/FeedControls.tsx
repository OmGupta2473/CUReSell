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
    <div className="space-y-3 rounded-[24px] border border-gray-100 bg-white p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
            <SlidersHorizontal size={16} />
            Filter and sort
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {typeof resultCount === 'number'
              ? `${resultCount} ${resultCount === 1 ? 'listing' : 'listings'} after filters`
              : 'Refine the feed with price, condition, and campus location'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
          {primaryLocationLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
              <MapPin size={12} />
              Your block: {primaryLocationLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Sort
          </span>
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value as ListingSortOption)}
            className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Hostel block
          </span>
          <select
            value={filters.hostelBlock}
            onChange={(e) => update('hostelBlock', e.target.value)}
            className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">All hostel blocks</option>
            {hostelOptions.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Department
          </span>
          <select
            value={filters.department}
            onChange={(e) => update('department', e.target.value)}
            className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">All departments</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
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
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              filters.condition === 'all'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            All conditions
          </button>
          {(Object.entries(CONDITION_LABELS) as [Condition, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => update('condition', filters.condition === value ? 'all' : value)}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.condition === value
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
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
