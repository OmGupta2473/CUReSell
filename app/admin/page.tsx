import { notFound, redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { createClient } from '@/lib/supabase/server';
import type { ListingStatus, Profile, Report, ReportReason } from '@/lib/types';

type AdminProfile = Pick<Profile, 'id' | 'full_name' | 'email' | 'department' | 'hostel_block' | 'is_admin'>;

interface RawListingRow {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  status: ListingStatus;
  category: keyof typeof import('@/lib/types').CATEGORY_LABELS;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface RawReportRow {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  description: string | null;
  status: Report['status'];
  created_at: string;
}

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email, department, hostel_block, is_admin')
    .eq('id', user.id)
    .single<AdminProfile>();

  if (!adminProfile?.is_admin) {
    notFound();
  }

  const [
    usersCountResult,
    activeListingsCountResult,
    totalReportsCountResult,
    pendingReportsCountResult,
    reportsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('reports')
      .select('id, listing_id, reporter_id, reason, description, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const reports = (reportsResult.data ?? []) as RawReportRow[];
  const listingIds = Array.from(new Set(reports.map((report) => report.listing_id)));
  const reporterIds = Array.from(new Set(reports.map((report) => report.reporter_id)));

  const [listingsResult, reportersResult] = await Promise.all([
    listingIds.length === 0
      ? Promise.resolve({ data: [] as RawListingRow[] })
      : supabase
          .from('listings')
          .select('id, seller_id, title, price, status, category, created_at, profiles(id, full_name, email)')
          .in('id', listingIds),
    reporterIds.length === 0
      ? Promise.resolve({ data: [] as AdminProfile[] })
      : supabase
          .from('profiles')
          .select('id, full_name, email, department, hostel_block, is_admin')
          .in('id', reporterIds),
  ]);

  const listingsById = new Map(
    ((listingsResult.data ?? []) as RawListingRow[]).map((listing) => [
      listing.id,
      {
        ...listing,
        seller: listing.profiles ?? null,
      },
    ])
  );

  const reportersById = new Map(
    ((reportersResult.data ?? []) as AdminProfile[]).map((profile) => [profile.id, profile])
  );

  const hydratedReports = reports.map((report) => ({
    ...report,
    reporter: reportersById.get(report.reporter_id) ?? null,
    listing: listingsById.get(report.listing_id) ?? null,
  }));

  return (
    <AdminDashboard
      adminName={adminProfile.full_name}
      stats={{
        users: usersCountResult.count ?? 0,
        activeListings: activeListingsCountResult.count ?? 0,
        totalReports: totalReportsCountResult.count ?? 0,
        pendingReports: pendingReportsCountResult.count ?? 0,
      }}
      initialReports={hydratedReports}
    />
  );
}
