'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Shield, Trash2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatFullPrice, timeAgo } from '@/lib/utils/formatters';
import { CATEGORY_LABELS, type ListingStatus, type ReportReason } from '@/lib/types';

interface AdminStats {
  users: number;
  activeListings: number;
  totalReports: number;
  pendingReports: number;
}

interface AdminReporter {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  hostel_block: string | null;
}

interface AdminSeller {
  id: string;
  full_name: string;
  email: string;
}

interface AdminReportListing {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  status: ListingStatus;
  category: keyof typeof CATEGORY_LABELS;
  created_at: string;
  seller: AdminSeller | null;
}

interface AdminReportItem {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  reporter: AdminReporter | null;
  listing: AdminReportListing | null;
}

interface AdminDashboardProps {
  adminName: string;
  stats: AdminStats;
  initialReports: AdminReportItem[];
}

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  fake: 'Fake listing',
  inappropriate: 'Inappropriate',
  already_sold: 'Already sold',
  other: 'Other',
};

export function AdminDashboard({
  adminName,
  stats,
  initialReports,
}: AdminDashboardProps) {
  const [reports, setReports] = useState(initialReports);
  const [busyReportId, setBusyReportId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === 'pending'),
    [reports]
  );

  async function handleReportStatus(
    reportId: string,
    status: 'reviewed' | 'dismissed'
  ) {
    setBusyReportId(reportId);

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      setReports((current) =>
        current.map((report) => (report.id === reportId ? { ...report, status } : report))
      );
      setMessage(status === 'reviewed' ? 'Report marked reviewed' : 'Report dismissed');
      router.refresh();
    } catch {
      setMessage('Could not update report status');
    } finally {
      setBusyReportId(null);
    }
  }

  async function handleListingStatus(reportId: string, listingId: string, status: ListingStatus) {
    setBusyReportId(reportId);

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', listingId);

      if (error) throw error;

      setReports((current) =>
        current.map((report) => {
          if (report.id !== reportId || !report.listing) return report;
          return {
            ...report,
            status: report.status === 'pending' ? 'reviewed' : report.status,
            listing: {
              ...report.listing,
              status,
            },
          };
        })
      );
      setMessage(status === 'deleted' ? 'Listing removed from the marketplace' : 'Listing status updated');
      router.refresh();
    } catch {
      setMessage('Could not update listing');
    } finally {
      setBusyReportId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(253,186,116,0.24),_transparent_35%),linear-gradient(180deg,_#fff7ed_0%,_#f8fafc_28%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-orange-300"
            >
              <ArrowLeft size={15} />
              Back to marketplace
            </Link>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                <Shield size={14} />
                Admin dashboard
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                Campus moderation, all in one place.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-gray-600">
                Review flagged listings, resolve reports, and keep the CUReSell marketplace trustworthy for Chandigarh University students.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/80 bg-white/90 px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{adminName}</p>
            <p className="mt-1 text-sm text-orange-700">
              {pendingReports.length} pending {pendingReports.length === 1 ? 'report' : 'reports'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Users</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.users}</p>
          </div>
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Active listings</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.activeListings}</p>
          </div>
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Pending reports</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.pendingReports}</p>
          </div>
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Total reports</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.totalReports}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[28px] border border-gray-100 bg-white p-5 md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">Recent reports</p>
                <p className="mt-1 text-sm text-gray-500">
                  Most recent flagged listings across the marketplace
                </p>
              </div>
              <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {reports.length} loaded
              </div>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div className="mt-5 space-y-4">
              {reports.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-5 py-14 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-600" size={28} />
                  <p className="mt-4 text-lg font-semibold text-gray-900">No reports right now</p>
                  <p className="mt-2 text-sm text-gray-500">
                    The moderation queue is clear.
                  </p>
                </div>
              )}

              {reports.map((report) => {
                const isBusy = busyReportId === report.id;

                return (
                  <article
                    key={report.id}
                    className="rounded-[24px] border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {REPORT_REASON_LABELS[report.reason]}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              report.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : report.status === 'reviewed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {report.status}
                          </span>
                          <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
                        </div>

                        <div>
                          <Link
                            href={report.listing ? `/listing/${report.listing.id}` : '/'}
                            className="text-lg font-semibold text-gray-900 hover:text-black"
                          >
                            {report.listing?.title ?? 'Listing unavailable'}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            {report.listing
                              ? `${CATEGORY_LABELS[report.listing.category]} · ${formatFullPrice(report.listing.price)} · ${report.listing.status}`
                              : 'This listing may have been removed already.'}
                          </p>
                        </div>

                        {report.description && (
                          <p className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-gray-600">
                            {report.description}
                          </p>
                        )}

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Reporter</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {report.reporter?.full_name ?? 'Unknown'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{report.reporter?.email}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {[report.reporter?.department, report.reporter?.hostel_block]
                                .filter(Boolean)
                                .join(' · ') || 'Campus user'}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Seller</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {report.listing?.seller?.full_name ?? 'Unknown'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{report.listing?.seller?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 md:w-44">
                        <button
                          onClick={() => void handleReportStatus(report.id, 'reviewed')}
                          disabled={isBusy || report.status === 'reviewed'}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} />
                          Review
                        </button>
                        <button
                          onClick={() => void handleReportStatus(report.id, 'dismissed')}
                          disabled={isBusy || report.status === 'dismissed'}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Dismiss
                        </button>
                        {report.listing && report.listing.status !== 'deleted' && (
                          <button
                            onClick={() => void handleListingStatus(report.id, report.listing!.id, 'deleted')}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            Remove listing
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-orange-700" />
                <p className="text-lg font-semibold text-gray-900">Queue snapshot</p>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-amber-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Pending</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{pendingReports.length}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Reviewed</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {reports.filter((report) => report.status === 'reviewed').length}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-600">Dismissed</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {reports.filter((report) => report.status === 'dismissed').length}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-700" />
                <p className="text-lg font-semibold text-gray-900">Moderation guidance</p>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                <p>Use “Review” when the issue is valid and already handled or needs no further action.</p>
                <p>Use “Dismiss” when the report is inaccurate, duplicate, or not actionable.</p>
                <p>Use “Remove listing” only when the item clearly violates marketplace rules.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
