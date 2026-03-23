'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, ShieldCheck, Sparkles, Store, Truck } from 'lucide-react';
import { useListings } from '@/lib/hooks/useListings';
import { useAuth } from '@/lib/hooks/useAuth';
import { ListingGrid, ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { CategoryFilter } from '@/components/listing/CategoryFilter';
import { SearchBar } from '@/components/listing/SearchBar';
import type { Category } from '@/lib/types';

const guestCategories = [
  { label: 'Furniture', icon: '🪑', blurb: 'Tables, chairs, lamps, organizers' },
  { label: 'Electronics', icon: '💻', blurb: 'Monitors, routers, gadgets, speakers' },
  { label: 'Books', icon: '📚', blurb: 'Semester notes, prep books, novels' },
  { label: 'Kitchen', icon: '🍳', blurb: 'Pans, kettles, mugs, mini appliances' },
  { label: 'Clothes', icon: '👕', blurb: 'Fresh fits, jackets, ethnic wear' },
  { label: 'Cycles', icon: '🚲', blurb: 'Campus rides and quick commutes' },
] as const;

const guestHighlights = [
  {
    title: 'Move-out season starts here',
    text: 'Final-year students can clear rooms quickly, and juniors can furnish a hostel without paying full price.',
    tone: 'from-orange-200 via-orange-100 to-white',
  },
  {
    title: 'Verified by college email',
    text: 'Every buyer and seller signs in with a campus email, keeping the marketplace local and more trustworthy.',
    tone: 'from-amber-100 via-white to-rose-50',
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified community',
    text: 'Only students with a valid college email can chat, post, and buy.',
  },
  {
    icon: Store,
    title: 'Built for campus life',
    text: 'Furniture, books, clothes, electronics, and daily hostel essentials in one place.',
  },
  {
    icon: Truck,
    title: 'Fast local handoff',
    text: 'Meet in the hostel, department block, or canteen instead of dealing with strangers.',
  },
] as const;

function GuestLanding() {
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
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Sign in with college email
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
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
          <Link href="/login" className="text-sm font-medium text-orange-700 hover:text-orange-800">
            Browse after sign-in
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guestCategories.map((category) => (
            <Link
              key={category.label}
              href="/login"
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
          <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-black">
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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: listings, isLoading, error } = useListings({
    category,
    search,
    enabled: !!user,
  });

  if (authLoading) {
    return <ListingGridSkeleton />;
  }

  if (!user) {
    return <GuestLanding />;
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter selected={category} onChange={setCategory} />

      {isLoading && <ListingGridSkeleton />}

      {error && (
        <div className="py-12 text-center text-gray-500">
          <p className="text-sm">Failed to load listings. Please refresh.</p>
        </div>
      )}

      {!isLoading && !error && listings && listings.length === 0 && (
        <div className="space-y-3 py-16 text-center">
          <div className="text-4xl">📦</div>
          <p className="font-medium text-gray-700">No listings yet</p>
          <p className="text-sm text-gray-400">
            {search || category
              ? 'Try a different search or category'
              : 'Be the first to post something!'}
          </p>
          {!search && !category && (
            <button
              onClick={() => router.push('/listing/new')}
              className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Post a listing
            </button>
          )}
        </div>
      )}

      {!isLoading && listings && listings.length > 0 && <ListingGrid listings={listings} />}

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

export default function HomePage() {
  return <FeedContent />;
}
