import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-2 p-2.5">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function ListingGrid({ listings }: ListingGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
