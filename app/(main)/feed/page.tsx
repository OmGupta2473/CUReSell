'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Sparkles, Store, Truck } from 'lucide-react';
import { useListings } from '@/lib/hooks/useListings';
import { useAuth } from '@/lib/hooks/useAuth';
import { FeedControls } from '@/components/listing/FeedControls';
import { ListingGrid, ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { CategoryFilter } from '@/components/listing/CategoryFilter';
import { SearchBar } from '@/components/listing/SearchBar';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/types';
import {
  DEFAULT_LISTING_FEED_FILTERS,
  applyListingFeedFilters,
  countActiveFeedFilters,
  getListingFilterOptions,
  type ListingFeedFilters,
} from '@/lib/utils/listingFeed';

const guestCategories = [
  { label: 'Furniture', blurb: 'Tables, chairs, lamps, organizers' },
  { label: 'Electronics', blurb: 'Monitors, routers, gadgets, speakers' },
  { label: 'Books', blurb: 'Semester notes, prep books, novels' },
  { label: 'Kitchen', blurb: 'Pans, kettles, mugs, mini appliances' },
  { label: 'Clothes', blurb: 'Fresh fits, jackets, ethnic wear' },
  { label: 'Cycles', blurb: 'Campus rides and quick commutes' },
] as const;

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified community',
    text: 'Only signed-in students can post, save, report, and chat.',
  },
  {
    icon: Store,
    title: 'Campus-first categories',
    text: 'Books, furniture, electronics, cycles, kitchen gear, and daily essentials.',
  },
  {
    icon: Truck,
    title: 'Easy local handoff',
    text: 'Coordinate pickup around campus instead of dealing with far-away buyers.',
  },
] as const;

function GuestLanding() {
  const loginHref = '/login';
  const sellHref = '/login?next=%2Flisting%2Fnew';

  return (
    <div className="space-y-8 pb-8">
      <section className="glass-panel grid gap-6 rounded-[1.8rem] p-5 md:grid-cols-[1.2fr_0.8fr] md:p-7">
        <div className="space-y-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/[0.12] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-100">
            <Sparkles size={14} />
            Campus marketplace
          </div>

          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
              Buy and sell what campus life actually needs.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Find student-friendly deals, post unused items quickly, and keep every handoff inside the CU community.
            </p>
          </div>

          <div className="glass-panel-muted rounded-[1.4rem] p-3">
            <div className="pointer-events-none">
              <SearchBar value="" onChange={() => {}} placeholder="What would you like to find on campus?" />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-400">
              Sign in to browse real listings, chat with sellers, and post your own item.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={loginHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] px-5 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(88,161,255,0.3)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Sign in
              <ArrowRight size={16} />
            </Link>
            <Link
              href={sellHref}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06] px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.1]"
            >
              Start selling
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {trustPoints.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="glass-panel-muted rounded-[1.4rem] p-4"
            >
              <div className="mb-3 inline-flex rounded-xl bg-white/[0.08] p-2 text-sky-100 shadow-sm">
                <Icon size={18} />
              </div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xl font-black tracking-tight text-white">
              Popular on campus
            </p>
            <p className="text-sm text-slate-400">
              The categories students check first
            </p>
          </div>
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-200 hover:text-sky-100"
          >
            Browse after sign-in
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guestCategories.map((category) => (
            <Link
              key={category.label}
              href={loginHref}
              className="glass-panel group rounded-[1.4rem] p-4 transition-all hover:-translate-y-1 hover:border-white/[0.16]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-sm font-black text-slate-100">
                  {category.label.slice(0, 2)}
                </span>
                <div>
                  <p className="text-base font-bold text-white">{category.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {category.blurb}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeedContent() {
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ListingFeedFilters>(DEFAULT_LISTING_FEED_FILTERS);
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: listings, isLoading, error } = useListings({
    category,
    search,
    enabled: true,
  });

  const filterOptions = useMemo(() => getListingFilterOptions(listings ?? []), [listings]);
  const filteredListings = useMemo(
    () => applyListingFeedFilters(listings ?? [], filters),
    [filters, listings]
  );
  const activeFilterCount = countActiveFeedFilters(filters);

  if (authLoading) {
    return <ListingGridSkeleton />;
  }

  if (!user) {
    return <GuestLanding />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[1.8rem] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/[0.12] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-100">
              <Sparkles size={14} />
              Live campus feed
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Find the next thing you need.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Browse recent listings, narrow by category and condition, then open a chat when something fits.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            <div className="glass-panel-muted rounded-[1.2rem] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Showing</p>
              <p className="mt-2 text-2xl font-black text-white">
                {filteredListings.length}
              </p>
            </div>
            <div className="glass-panel-muted rounded-[1.2rem] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Filters</p>
              <p className="mt-2 text-2xl font-black text-white">
                {activeFilterCount}
              </p>
            </div>
            <div className="glass-panel-muted rounded-[1.2rem] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Area</p>
              <p className="mt-2 truncate text-base font-black text-white">
                {profile?.hostel_block || 'Campus'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-[1.6rem] p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-black tracking-tight text-white">
              Search and refine
            </p>
            <p className="text-sm text-slate-400">
              Start broad, then narrow the feed down.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-200 hover:text-sky-100"
          >
            Full search
            <ArrowRight size={14} />
          </Link>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search books, laptops, chairs, cookware..."
        />
        <CategoryFilter selected={category} onChange={setCategory} />
        <FeedControls
          filters={filters}
          onChange={setFilters}
          hostelOptions={filterOptions.hostelBlocks}
          departmentOptions={filterOptions.departments}
          resultCount={filteredListings.length}
          activeFilterCount={activeFilterCount}
          primaryLocationLabel={profile?.hostel_block}
        />
      </section>

      {isLoading && <ListingGridSkeleton />}

      {error && (
        <div className="rounded-[1.4rem] border border-red-400/20 bg-red-400/[0.12] p-6 text-center">
          <p className="text-sm font-semibold text-red-100">
            Failed to load listings. Please refresh.
          </p>
        </div>
      )}

      {!isLoading && !error && listings && filteredListings.length === 0 && (
        <div className="glass-panel-muted rounded-[1.6rem] border border-dashed border-white/[0.12] p-8 text-center">
          <p className="text-lg font-black text-white">
            No listings match these filters
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            {search || category || activeFilterCount > 0
              ? 'Try a different keyword, category, or filter combination.'
              : 'Be the first to post something useful for campus.'}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            {(search || category || activeFilterCount > 0) && (
              <Button
                onClick={() => {
                  setSearch('');
                  setCategory(null);
                  setFilters(DEFAULT_LISTING_FEED_FILTERS);
                }}
              >
                Clear everything
              </Button>
            )}
            {!search && !category && activeFilterCount === 0 && (
              <Button variant="primary" onClick={() => router.push('/listing/new')}>
                Post a listing
              </Button>
            )}
          </div>
        </div>
      )}

      {!isLoading && filteredListings.length > 0 && <ListingGrid listings={filteredListings} />}
    </div>
  );
}

export default function FeedPage() {
  return <FeedContent />;
}
