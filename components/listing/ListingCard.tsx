import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, timeAgo, conditionColor } from '@/lib/utils/formatters';
import { CONDITION_LABELS } from '@/lib/types';
import type { Listing } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const firstImage = listing.listing_images?.[0];
  const isSold = listing.status === 'sold';

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:border-gray-200 hover:shadow-sm">
        <div className="relative aspect-square bg-gray-100">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={listing.title}
              fill
              className={`object-cover ${isSold ? 'opacity-50' : ''}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
                Sold
              </span>
            </div>
          )}
          {listing.is_negotiable && !isSold && (
            <div className="absolute left-2 top-2">
              <span className="rounded-full border border-gray-200 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                Negotiable
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1 p-2.5">
          <p className="text-sm font-semibold text-gray-900">{formatPrice(listing.price)}</p>
          <p className="truncate text-sm leading-tight text-gray-600">{listing.title}</p>
          <div className="flex items-center justify-between pt-0.5">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conditionColor(
                listing.condition
              )}`}
            >
              {CONDITION_LABELS[listing.condition]}
            </span>
            <span className="text-[10px] text-gray-400">{timeAgo(listing.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
