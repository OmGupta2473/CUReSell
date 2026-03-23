'use client';

import { useMemo, useState } from 'react';
import { ListingGrid } from '@/components/listing/ListingGrid';
import type { Listing, ListingStatus } from '@/lib/types';

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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">
            {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'} shown
          </p>
        </div>
        {allowFiltering && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelected(filter.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected === filter.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
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
        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-8 text-center">
          <div className="text-4xl">🛍️</div>
          <p className="mt-3 text-base font-semibold text-gray-900">Nothing here yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Listings from this profile will show up here once posted.
          </p>
        </div>
      )}
    </div>
  );
}
