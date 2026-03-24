'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flag, Heart, MessageCircle, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { conditionColor, formatFullPrice, timeAgo } from '@/lib/utils/formatters';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/types';
import type { Listing, ListingFavorite, Report, ReportReason } from '@/lib/types';

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
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listing.id);
    router.refresh();
  }

  async function handleStartChat() {
    if (!user || !seller) return;
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
    <div className="mx-auto max-w-2xl pb-28">
      <div className="sticky top-14 z-10 flex items-center justify-between bg-gray-50 py-3">
        <button
          onClick={() => router.back()}
          className="-ml-2 rounded-xl p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleToggleFavorite()}
            disabled={!user || isSeller || favoriteLoading}
            className={`rounded-xl p-2 transition-colors ${
              saved ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-100'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Save listing"
          >
            {favoriteLoading ? (
              <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current/25 border-t-current" />
            ) : (
              <Heart size={18} className={saved ? 'fill-current' : ''} />
            )}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Share2 size={16} />
            {shareLabel}
          </button>
        </div>
      </div>

      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[28px] bg-gray-100">
        {images.length > 0 ? (
          <Image src={images[currentImage].url} alt={listing.title} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white">
              Sold
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrentImage(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
                i === currentImage ? 'border-gray-900' : 'border-transparent'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mb-5 rounded-[28px] border border-gray-100 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${conditionColor(listing.condition)}`}>
                {CONDITION_LABELS[listing.condition]}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {CATEGORY_LABELS[listing.category]}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">{listing.title}</h1>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatFullPrice(listing.price)}</p>
            {listing.is_negotiable && <p className="text-xs text-gray-400">Negotiable</p>}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>{timeAgo(listing.created_at)}</span>
          <span>·</span>
          <span>{listing.view_count} views</span>
        </div>

        {listing.description && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="text-sm leading-7 text-gray-700">{listing.description}</p>
          </div>
        )}
      </div>

      {seller && (
        <Link href={`/profile/${seller.id}`}>
          <div className="mb-5 flex items-center gap-3 rounded-[24px] border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {seller.avatar_url ? (
                <Image src={seller.avatar_url} alt={seller.full_name} width={44} height={44} className="object-cover" />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {seller.full_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold text-gray-900 truncate">{seller.full_name}</p>
                {seller.is_cu_verified && <VerifiedBadge size="sm" showLabel />}
              </div>
              <p className="truncate text-xs text-gray-500">
                {[seller.department, seller.hostel_block, seller.year_of_study].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className="text-sm text-gray-400">View</span>
          </div>
        </Link>
      )}

      {!isSeller && user && (
        <div className="mb-6 space-y-3">
          <button
            onClick={() => setReportOpen((value) => !value)}
            disabled={reportSubmitted}
            className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:text-emerald-600"
          >
            <Flag size={12} />
            {reportSubmitted ? 'Report submitted' : reportOpen ? 'Hide report form' : 'Report this listing'}
          </button>

          {reportOpen && !reportSubmitted && (
            <div className="rounded-[24px] border border-gray-100 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Report this listing</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  This sends the listing to campus admins for review. Reports are limited to one per user per listing.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setReportReason(reason.value)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                      reportReason === reason.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{reason.label}</p>
                    <p
                      className={`mt-1 text-xs leading-5 ${
                        reportReason === reason.value ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {reason.helper}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Extra details
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(event) => setReportDescription(event.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Anything an admin should know before reviewing this listing?"
                  className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {reportError && <p className="mt-3 text-xs text-red-500">{reportError}</p>}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitReport()}
                  disabled={reportLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reportLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : null}
                  Submit report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {actionMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white p-4 pb-safe">
        <div className="mx-auto max-w-2xl">
          {isSeller ? (
            <div className="flex gap-2">
              <Link
                href={`/listing/${listing.id}/edit`}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Edit
              </Link>
              {!isSold && (
                <button
                  onClick={handleMarkSold}
                  className="h-11 flex-1 rounded-xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-black"
                >
                  Mark as sold
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleStartChat}
              disabled={chatLoading || isSold}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chatLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <MessageCircle size={18} />
                  {isSold ? 'This item is sold' : 'Chat with seller'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
