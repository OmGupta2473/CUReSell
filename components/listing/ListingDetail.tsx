'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Flag,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  Share2,
  Tag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { conditionColor, formatFullPrice, timeAgo } from '@/lib/utils/formatters';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/types';
import type { Listing, ListingFavorite, Report, ReportReason } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

const REPORT_REASONS: { value: ReportReason; label: string; helper: string }[] = [
  { value: 'spam', label: 'Spam', helper: 'Looks promotional, misleading, or irrelevant.' },
  { value: 'fake', label: 'Fake listing', helper: 'Seems fraudulent or not actually available.' },
  { value: 'inappropriate', label: 'Inappropriate', helper: 'Contains abusive or unsafe content.' },
  { value: 'already_sold', label: 'Already sold', helper: 'Seller has likely completed the deal already.' },
  { value: 'other', label: 'Other', helper: 'Something else needs moderator review.' },
];

interface ListingDetailProps {
  listing: Listing;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [shareLabel, setShareLabel] = useState('Share');
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const images = listing.listing_images ?? [];
  const seller = listing.profiles;
  const isSeller = user?.id === listing.seller_id;
  const isSold = listing.status === 'sold';

  useEffect(() => {
    if (!user || isSeller) return;

    let cancelled = false;
    const userId = user.id;

    async function loadUserActions() {
      const [{ data: favorite }, { data: report }] = await Promise.all([
        supabase
          .from('listing_favorites')
          .select('id')
          .eq('listing_id', listing.id)
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('reports')
          .select('id, reason, description')
          .eq('listing_id', listing.id)
          .eq('reporter_id', userId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const typedFavorite = favorite as Pick<ListingFavorite, 'id'> | null;
      const typedReport = report as Pick<Report, 'id' | 'reason' | 'description'> | null;

      setFavoriteId(typedFavorite?.id ?? null);
      setSaved(Boolean(typedFavorite));

      if (typedReport) {
        setReportSubmitted(true);
        setReportReason(typedReport.reason);
        setReportDescription(typedReport.description ?? '');
      }
    }

    void loadUserActions();

    return () => {
      cancelled = true;
    };
  }, [isSeller, listing.id, supabase, user]);

  useEffect(() => {
    if (!actionMessage) return;

    const timeout = window.setTimeout(() => setActionMessage(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  async function handleMarkSold() {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listing.id)
        .eq('seller_id', user.id);

      if (error) throw error;

      setActionMessage('Listing marked as sold');
      router.refresh();
    } catch {
      setActionMessage('Could not mark listing as sold');
    }
  }

  async function handleStartChat() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/listing/${listing.id}`)}`);
      return;
    }
    if (!seller) return;
    setChatLoading(true);

    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .single();

      if (existing) {
        router.push(`/messages/${existing.id}`);
        return;
      }

      const { data: created, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
        })
        .select('id')
        .single();

      if (error) throw error;
      router.push(`/messages/${created.id}`);
    } catch {
      setChatLoading(false);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: listing.title,
        text: `${listing.title} - ${formatFullPrice(listing.price)}`,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setShareLabel('Link copied');
    setTimeout(() => setShareLabel('Share'), 1800);
  }

  async function handleToggleFavorite() {
    if (!user || isSeller || favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      if (favoriteId) {
        const { error } = await supabase
          .from('listing_favorites')
          .delete()
          .eq('id', favoriteId)
          .eq('user_id', user.id);

        if (error) throw error;

        setFavoriteId(null);
        setSaved(false);
        setActionMessage('Removed from favorites');
      } else {
        const { data, error } = await supabase
          .from('listing_favorites')
          .insert({
            listing_id: listing.id,
            user_id: user.id,
          })
          .select('id')
          .single();

        if (error) throw error;

        setFavoriteId((data as Pick<ListingFavorite, 'id'>).id);
        setSaved(true);
        setActionMessage('Saved to favorites');
      }
    } catch {
      setActionMessage('Could not update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleSubmitReport() {
    if (!user || reportSubmitted || reportLoading) return;

    setReportLoading(true);
    setReportError('');

    try {
      const { error } = await supabase.from('reports').insert({
        listing_id: listing.id,
        reporter_id: user.id,
        reason: reportReason,
        description: reportDescription.trim() || null,
      });

      if (error) throw error;

      setReportSubmitted(true);
      setReportOpen(false);
      setActionMessage('Report submitted');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Could not submit your report right now.';
      setReportError(message);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="pb-24 sm:pb-28">
      <div className="sticky top-16 z-30 -mx-4 border-b border-white/[0.08] bg-[rgb(var(--background))]/72 px-4 py-2.5 backdrop-blur-2xl md:-mx-6 md:px-6 md:py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (!user) {
                  router.push(`/login?next=${encodeURIComponent(`/listing/${listing.id}`)}`);
                  return;
                }
                void handleToggleFavorite();
              }}
              disabled={isSeller || favoriteLoading}
              aria-label={saved ? 'Remove listing from favorites' : 'Save listing'}
              className={saved ? 'text-rose-600 dark:text-rose-300' : undefined}
            >
              {favoriteLoading ? (
                <span className="h-4 w-4 animate-pulse rounded-full bg-current/30" />
              ) : (
                <Heart size={18} className={saved ? 'fill-current' : ''} />
              )}
            </Button>
            <Button variant="ghost" onClick={handleShare} className="px-2.5 sm:px-4">
              <Share2 size={16} />
              <span className="hidden sm:inline">{shareLabel}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 pt-4 sm:gap-5 sm:pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start xl:grid-cols-[minmax(0,1.08fr)_24rem]">
        <section className="space-y-3 sm:space-y-4 lg:max-w-2xl">
          <div className="glass-panel relative aspect-[5/4] overflow-hidden rounded-[1.6rem] sm:aspect-[4/3] lg:aspect-[16/9]">
            {images.length > 0 ? (
              <Image
                src={images[currentImage].url}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                <ImageIcon size={48} strokeWidth={1.5} />
              </div>
            )}
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="rounded-full border border-white/[0.16] bg-black/60 px-4 py-2 text-sm font-bold text-white">
                  Sold
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div
              className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide sm:gap-2"
              aria-label="Listing images"
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setCurrentImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === currentImage}
                  className={cn(
                    'relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border transition-colors sm:h-16 sm:w-16',
                    i === currentImage
                      ? 'border-sky-300/20 ring-2 ring-sky-400/20'
                      : 'border-white/[0.08] hover:border-white/[0.16]'
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <article className="glass-panel rounded-[1.6rem] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${conditionColor(
                      listing.condition
                    )}`}
                  >
                    {CONDITION_LABELS[listing.condition]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-slate-300">
                    <Tag size={12} />
                    {CATEGORY_LABELS[listing.category]}
                  </span>
                </div>

                <div>
                  <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl md:text-3xl">
                    {listing.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[11px] font-medium text-slate-400 sm:mt-3 sm:gap-3 sm:text-xs">
                    <span>{timeAgo(listing.created_at)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} />
                      {listing.view_count} views
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {formatFullPrice(listing.price)}
                </p>
                {listing.is_negotiable && (
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                    Negotiable
                  </p>
                )}
              </div>
            </div>

            {listing.description && (
              <div className="mt-4 border-t border-white/[0.08] pt-4 sm:mt-5 sm:pt-5">
                <h2 className="text-sm font-black text-white">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300 sm:leading-7">
                  {listing.description}
                </p>
              </div>
            )}
          </article>
        </section>

        <aside className="space-y-3 sm:space-y-4 xl:sticky xl:top-36">
          {seller && (
            <Link
              href={`/profile/${seller.id}`}
              className="glass-panel block rounded-[1.4rem] p-3.5 transition-all hover:-translate-y-0.5 hover:border-white/[0.16] sm:p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.08]">
                  {seller.avatar_url ? (
                    <Image
                      src={seller.avatar_url}
                      alt={seller.full_name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-black text-slate-200">
                      {seller.full_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-black text-white">
                      {seller.full_name}
                    </p>
                    {seller.is_cu_verified && <VerifiedBadge size="sm" showLabel />}
                  </div>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400">
                    <MapPin size={12} />
                    {[seller.department, seller.hostel_block, seller.year_of_study]
                      .filter(Boolean)
                      .join(' / ') || 'Campus seller'}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-500">View</span>
              </div>
            </Link>
          )}

          {actionMessage && (
            <div
              role="status"
              className="rounded-[1.2rem] border border-sky-300/20 bg-sky-400/[0.12] px-4 py-3 text-sm font-semibold text-sky-100"
            >
              {actionMessage}
            </div>
          )}

          {!isSeller && user && (
            <div className="glass-panel rounded-[1.4rem] p-3.5 sm:p-4">
              <button
                type="button"
                onClick={() => setReportOpen((value) => !value)}
                disabled={reportSubmitted}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-sky-200"
              >
                <Flag size={14} />
                {reportSubmitted ? 'Report submitted' : reportOpen ? 'Hide report form' : 'Report this listing'}
              </button>

              {reportOpen && !reportSubmitted && (
                <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                  <div>
                    <p className="text-sm font-black text-white">Report this listing</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      This sends the listing to campus admins for review. Reports are limited to one per user per listing.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => setReportReason(reason.value)}
                        className={cn(
                          'w-full rounded-[1.1rem] border px-3 py-3 text-left transition-all',
                          reportReason === reason.value
                            ? 'border-sky-300/20 bg-sky-400/[0.16] text-white shadow-[0_16px_36px_rgba(88,161,255,0.18)]'
                            : 'border-white/[0.08] bg-white/[0.04] text-slate-200 hover:border-white/[0.14] hover:bg-white/[0.07]'
                        )}
                      >
                        <p className="text-sm font-bold">{reason.label}</p>
                        <p
                          className={cn(
                            'mt-1 text-xs leading-5',
                            reportReason === reason.value
                              ? 'text-white/70'
                              : 'text-slate-400'
                          )}
                        >
                          {reason.helper}
                        </p>
                      </button>
                    ))}
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Extra details
                    </span>
                    <textarea
                      value={reportDescription}
                      onChange={(event) => setReportDescription(event.target.value)}
                      rows={3}
                      maxLength={300}
                      placeholder="Anything an admin should know before reviewing this listing?"
                      className="w-full resize-none rounded-[1.1rem] border border-white/[0.1] bg-white/[0.06] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
                    />
                  </label>

                  {reportError && <p className="text-xs font-semibold text-red-500">{reportError}</p>}

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => setReportOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      variant="primary"
                      onClick={() => void handleSubmitReport()}
                      disabled={reportLoading}
                    >
                      {reportLoading ? 'Submitting...' : 'Submit report'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[rgb(var(--background))]/75 px-3 py-3 pb-safe backdrop-blur-2xl sm:px-4 sm:py-4">
        <div className="mx-auto max-w-6xl">
          {isSeller ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href={`/listing/${listing.id}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.1] sm:h-11"
              >
                Edit listing
              </Link>
              {!isSold && (
                <Button variant="primary" size="lg" onClick={handleMarkSold}>
                  Mark as sold
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartChat}
              disabled={chatLoading || isSold}
              className="w-full"
            >
              <MessageCircle size={18} />
              {chatLoading
                ? 'Opening chat...'
                : isSold
                  ? 'This item is sold'
                  : user
                    ? 'Chat with seller'
                    : 'Log in to chat'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
