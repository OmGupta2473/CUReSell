'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, ShieldCheck, Sparkles, Store, Truck } from 'lucide-react';
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
      <section className="grid gap-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1.2fr_0.8fr] md:p-7">
        <div className="space-y-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles size={14} />
            Campus marketplace
          </div>

          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
              Buy and sell what campus life actually needs.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
              Find student-friendly deals, post unused items quickly, and keep every handoff inside the CU community.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="pointer-events-none">
              <SearchBar value="" onChange={() => {}} placeholder="What would you like to find on campus?" />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Sign in to browse real listings, chat with sellers, and post your own item.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={loginHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              Sign in
              <ArrowRight size={16} />
            </Link>
            <Link
              href={sellHref}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Start selling
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {trustPoints.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="mb-3 inline-flex rounded-lg bg-white p-2 text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300">
                <Icon size={18} />
              </div>
              <p className="text-sm font-bold text-gray-950 dark:text-white">{title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xl font-black tracking-tight text-gray-950 dark:text-white">
              Popular on campus
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The categories students check first
            </p>
          </div>
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
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
              className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-black text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {category.label.slice(0, 2)}
                </span>
                <div>
                  <p className="text-base font-bold text-gray-950 dark:text-white">{category.label}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
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
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles size={14} />
              Live campus feed
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
                Find the next thing you need.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Browse recent listings, narrow by category and condition, then open a chat when something fits.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Showing</p>
              <p className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                {filteredListings.length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Filters</p>
              <p className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                {activeFilterCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Area</p>
              <p className="mt-2 truncate text-base font-black text-gray-950 dark:text-white">
                {profile?.hostel_block || 'Campus'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-black tracking-tight text-gray-950 dark:text-white">
              Search and refine
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start broad, then narrow the feed down.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/30">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Failed to load listings. Please refresh.
          </p>
        </div>
      )}

      {!isLoading && !error && listings && filteredListings.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-lg font-black text-gray-950 dark:text-white">
            No listings match these filters
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
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

      <button
        onClick={() => router.push('/listing/new')}
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg transition-colors hover:bg-emerald-600 md:hidden"
        aria-label="Post a listing"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

export default function FeedPage() {
  return <FeedContent />;
}
