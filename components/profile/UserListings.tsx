'use client';

import { useMemo, useState } from 'react';
import { PackageOpen } from 'lucide-react';
import { ListingGrid } from '@/components/listing/ListingGrid';
import type { Listing, ListingStatus } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface UserListingsProps {
  listings: Listing[];
  title?: string;
  allowFiltering?: boolean;
}

const filters: Array<{ label: string; value: 'all' | ListingStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Expired', value: 'expired' },
];

export function UserListings({
  listings,
  title = 'Listings',
  allowFiltering = true,
}: UserListingsProps) {
  const [selected, setSelected] = useState<'all' | ListingStatus>('all');

  const filteredListings = useMemo(() => {
    if (!allowFiltering || selected === 'all') return listings;
    return listings.filter((listing) => listing.status === selected);
  }, [allowFiltering, listings, selected]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-950 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'} shown
          </p>
        </div>
        {allowFiltering && (
          <div
            className="flex snap-x gap-2 overflow-x-auto pb-1 scrollbar-hide"
            role="group"
            aria-label="Listing status filters"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelected(filter.value)}
                aria-pressed={selected === filter.value}
                className={cn(
                  'tap-target shrink-0 snap-start rounded-lg border px-3 py-2 text-sm font-bold transition-colors',
                  selected === filter.value
                    ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredListings.length > 0 ? (
        <ListingGrid listings={filteredListings} />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <PackageOpen className="mx-auto text-gray-300 dark:text-gray-600" size={34} />
          <p className="mt-3 text-base font-black text-gray-950 dark:text-white">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
            Listings from this profile will show up here once posted.
          </p>
        </div>
      )}
    </section>
  );
}
