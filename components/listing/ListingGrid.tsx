import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
}

function SkeletonCard() {
  return (
    <div className="content-auto overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-square animate-pulse bg-gray-100 dark:bg-gray-800" />
      <div className="space-y-3 p-3">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ListingGrid({ listings }: ListingGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <div key={listing.id} className="content-auto">
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
