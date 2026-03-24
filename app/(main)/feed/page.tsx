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
import type { Category } from '@/lib/types';
import {
  DEFAULT_LISTING_FEED_FILTERS,
  applyListingFeedFilters,
  countActiveFeedFilters,
  getListingFilterOptions,
  type ListingFeedFilters,
} from '@/lib/utils/listingFeed';

const guestCategories = [
  { label: 'Furniture', icon: 'Ã°Å¸Âªâ€˜', blurb: 'Tables, chairs, lamps, organizers' },
  { label: 'Electronics', icon: 'Ã°Å¸â€™Â»', blurb: 'Monitors, routers, gadgets, speakers' },
  { label: 'Books', icon: 'Ã°Å¸â€œÅ¡', blurb: 'Semester notes, prep books, novels' },
  { label: 'Kitchen', icon: 'Ã°Å¸ÂÂ³', blurb: 'Pans, kettles, mugs, mini appliances' },
  { label: 'Clothes', icon: 'Ã°Å¸â€˜â€¢', blurb: 'Fresh fits, jackets, ethnic wear' },
  { label: 'Cycles', icon: 'Ã°Å¸Å¡Â²', blurb: 'Campus rides and quick commutes' },
] as const;

const guestHighlights = [
  {
    title: 'Move-out season starts here',
    text: 'Final-year students can sell faster, and others can set up their space without paying full price.',
    tone: 'from-orange-200 via-orange-100 to-white',
  },
  {
    title: 'Verified by college email',
    text: 'Every buyer and seller signs in with a campus email, keeping the marketplace local and more trustworthy.',
    tone: 'from-amber-100 via-white to-rose-50',
  },
] as const;

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified community',
    text: 'Only students with a valid college email can chat, post, and buy.',
  },
  {
    icon: Store,
    title: 'Built for campus life',
    text: 'Furniture, books, clothes, electronics, and daily student essentials in one place.',
  },
  {
    icon: Truck,
    title: 'Fast local handoff',
    text: 'Meet near campus, in your area, or at a convenient pickup spot instead of dealing with strangers.',
  },
] as const;

function GuestLanding() {
  const loginHref = '/login';
  const sellHref = '/login?next=%2Flisting%2Fnew';

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-100 via-amber-50 to-white px-5 py-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.28)] md:px-8 md:py-8">
        <div className="grid gap-6 md:grid-cols-[1.3fr_0.9fr] md:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
              <Sparkles size={14} />
              Campus marketplace
            </div>
            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
                Buy and sell what campus life actually needs.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-gray-600 md:text-base">
                CUReSell brings the Carousell-style browsing experience to one trusted college
                community. Think study tables, books, cycles, kitchen gear, and move-out deals,
                all inside your campus network.
              </p>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
              <div className="pointer-events-none">
                <SearchBar value="" onChange={() => {}} placeholder="What would you like to find on campus?" />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Sign in to browse real listings, chat with sellers, and post your own item.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Sign in with college email
                <ArrowRight size={16} />
              </Link>
              <Link
                href={sellHref}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300"
              >
                Start selling
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {guestHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className={`rounded-[24px] border border-white/80 bg-gradient-to-br ${highlight.tone} p-5 shadow-sm`}
              >
                <p className="text-sm font-semibold text-gray-900">{highlight.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">{highlight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">Popular on campus</p>
            <p className="text-sm text-gray-500">The categories students check first</p>
          </div>
          <Link href={loginHref} className="text-sm font-medium text-orange-700 hover:text-orange-800">
            Browse after sign-in
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guestCategories.map((category) => (
            <Link
              key={category.label}
              href={loginHref}
              className="group rounded-[22px] border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-2xl">{category.icon}</span>
                  <p className="mt-3 text-base font-semibold text-gray-900">{category.label}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">{category.blurb}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                  Campus
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-100 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">Why students will actually use this</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              The MVP stays simple on purpose: verified students, quick listing posts, local handoff,
              and no strangers or spam.
            </p>
          </div>
          <Link href={loginHref} className="text-sm font-medium text-gray-900 hover:text-black">
            Join the campus marketplace
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-gray-50 p-4">
              <div className="inline-flex rounded-2xl bg-white p-2 text-orange-700 shadow-sm">
                <Icon size={18} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">{text}</p>
            </div>
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
    enabled: true, // Allow public users to see listings
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
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#334155_100%)] px-5 py-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.65)] md:px-7 md:py-7">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
              <Sparkles size={14} />
              Student marketplace
            </div>
            <div className="space-y-2">
              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white md:text-4xl">
                Discover the newest campus listings in one fast-moving feed.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Browse recent deals, filter by area and condition, and jump into chats with verified CU students without the clutter of generic marketplaces.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Live feed</p>
                <p className="mt-2 text-2xl font-semibold text-white">{filteredListings.length}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {filteredListings.length === 1 ? 'listing showing now' : 'listings showing now'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Filters</p>
                <p className="mt-2 text-2xl font-semibold text-white">{activeFilterCount}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {activeFilterCount === 0 ? 'Nothing narrowed yet' : 'Active refinements'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Your area</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {profile?.hostel_block || 'Campus'}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Helpful for nearby pickup planning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[30px] border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4 shadow-[0_16px_50px_-40px_rgba(15,23,42,0.35)] md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">Search and explore</p>
            <p className="mt-1 text-sm text-gray-500">
              Start broad, then narrow the feed down to what fits your budget and area.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 transition-colors hover:text-orange-800"
          >
            Open full search
            <ArrowRight size={14} />
          </Link>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search for books, laptops, chairs, cookware..."
        />
        <CategoryFilter selected={category} onChange={setCategory} />

      </section>

      {isLoading && <ListingGridSkeleton />}

      {error && (
        <div className="py-12 text-center text-gray-500">
          <p className="text-sm">Failed to load listings. Please refresh.</p>
        </div>
      )}

      {!isLoading && !error && listings && filteredListings.length === 0 && (
        <div className="space-y-3 py-16 text-center">
          <div className="text-4xl">Ã°Å¸â€œÂ¦</div>
          <p className="font-medium text-gray-700">No listings match these filters</p>
          <p className="text-sm text-gray-400">
            {search || category || activeFilterCount > 0
              ? 'Try a different keyword, category, or filter combination'
              : 'Be the first to post something!'}
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            {(search || category || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory(null);
                  setFilters(DEFAULT_LISTING_FEED_FILTERS);
                }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
              >
                Clear everything
              </button>
            )}
            {!search && !category && activeFilterCount === 0 && (
              <button
                onClick={() => router.push('/listing/new')}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Post a listing
              </button>
            )}
          </div>
        </div>
      )}

      {!isLoading && filteredListings.length > 0 && <ListingGrid listings={filteredListings} />}

      <button
        onClick={() => router.push('/listing/new')}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-colors hover:bg-gray-800 md:hidden"
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
