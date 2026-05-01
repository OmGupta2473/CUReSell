import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
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
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
      aria-label={`View listing: ${listing.title}`}
    >
      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-colors motion-safe:transition-all motion-safe:group-hover:-translate-y-0.5 group-hover:border-gray-300 group-hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:group-hover:border-gray-700">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={listing.title}
              fill
              className={`object-cover transition duration-300 motion-safe:group-hover:scale-105 ${
                isSold ? 'opacity-50 grayscale' : ''
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
              <ImageIcon size={34} strokeWidth={1.5} />
            </div>
          )}

          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="rounded-full bg-gray-950/85 px-3 py-1 text-xs font-bold text-white">
                Sold
              </span>
            </div>
          )}

          {listing.is_negotiable && !isSold && (
            <span className="absolute left-2 top-2 rounded-full border border-white/80 bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-700 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-950/80 dark:text-gray-200">
              Negotiable
            </span>
          )}
        </div>

        <div className="space-y-2 p-3">
          <div className="space-y-1">
            <p className="text-base font-black tracking-tight text-gray-950 dark:text-white">
              {formatPrice(listing.price)}
            </p>
            <p className="line-clamp-2 min-h-[2.25rem] text-sm leading-snug text-gray-600 dark:text-gray-300">
              {listing.title}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${conditionColor(
                  listing.condition
                )}`}
              >
                {CONDITION_LABELS[listing.condition]}
              </span>
              {listing.profiles?.is_cu_verified && <VerifiedBadge size="sm" />}
            </div>
            <span className="shrink-0 text-[11px] font-medium text-gray-400">
              {timeAgo(listing.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
