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
          <h2 className="text-xl font-black tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'} shown
          </p>
        </div>
        {allowFiltering && (
          <div
            className="flex snap-x gap-2 overflow-x-auto pb-1 scrollbar-hide premium-scrollbar"
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
                  'tap-target shrink-0 snap-start rounded-xl border px-3 py-2 text-sm font-bold transition-all',
                  selected === filter.value
                    ? 'border-sky-300/20 bg-sky-400/[0.16] text-sky-100 shadow-[0_14px_28px_rgba(88,161,255,0.18)]'
                    : 'border-white/[0.08] bg-white/[0.05] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white'
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
        <div className="glass-panel-muted rounded-[1.6rem] border border-dashed border-white/[0.12] p-8 text-center">
          <PackageOpen className="mx-auto text-slate-500" size={34} />
          <p className="mt-3 text-base font-black text-white">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-400">
            Listings from this profile will show up here once posted.
          </p>
        </div>
      )}
    </section>
  );
}
