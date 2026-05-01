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
      className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--focus))]"
      aria-label={`View listing: ${listing.title}`}
    >
      <article className="glass-panel soft-shadow h-full overflow-hidden rounded-[1.4rem] border border-white/[0.08] transition-all duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:border-white/[0.16] motion-safe:group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.34)]">
        <div className="relative aspect-square overflow-hidden bg-white/[0.04]">
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/28 backdrop-blur-[2px]">
              <span className="rounded-full border border-white/[0.16] bg-black/55 px-3 py-1 text-xs font-bold text-white">
                Sold
              </span>
            </div>
          )}

          {listing.is_negotiable && !isSold && (
            <span className="absolute left-2 top-2 rounded-full border border-white/[0.22] bg-black/35 px-2 py-1 text-[10px] font-bold text-slate-100 shadow-sm backdrop-blur-xl">
              Negotiable
            </span>
          )}
        </div>

        <div className="space-y-2 p-3.5">
          <div className="space-y-1">
            <p className="text-base font-black tracking-tight text-white">
              {formatPrice(listing.price)}
            </p>
            <p className="line-clamp-2 min-h-[2.25rem] text-sm leading-snug text-slate-300">
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
            <span className="shrink-0 text-[11px] font-medium text-slate-500">
              {timeAgo(listing.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
