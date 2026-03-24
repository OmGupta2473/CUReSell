'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { CATEGORY_LABELS, CONDITION_LABELS, type Category, type Listing } from '@/lib/types';
import { conditionColor, formatPrice, timeAgo } from '@/lib/utils/formatters';

const CATEGORY_ICONS: Record<Category, string> = {
  books: '📚',
  electronics: '💻',
  furniture: '🪑',
  kitchen: '🍳',
  clothes: '👕',
  cycles: '🚲',
  sports: '⚽',
  other: '📦',
};

const BANNER_SLIDES = [
  {
    tag: 'For final year students',
    heading: 'Leaving campus? Sell your stuff in minutes.',
    sub: 'Study tables, mattresses, kitchen items, and daily essentials find a new owner fast.',
    cta: 'Post a listing',
    href: '/login?next=%2Flisting%2Fnew',
    bg: 'from-slate-900 to-slate-700',
    accent: '#f59e0b',
  },
  {
    tag: 'For students moving in',
    heading: 'Set up your space for a fraction of the price.',
    sub: 'Buy quality second-hand items from verified CU students.',
    cta: 'Browse listings',
    href: '/search',
    bg: 'from-teal-900 to-teal-700',
    accent: '#5eead4',
  },
  {
    tag: 'Electronics',
    heading: 'Calculators, laptops, lab equipment — all here.',
    sub: 'Trusted sellers, in-app chat, no OLX spam.',
    cta: 'See electronics',
    href: '/search?category=electronics',
    bg: 'from-indigo-900 to-indigo-700',
    accent: '#a5b4fc',
  },
  {
    tag: 'Books & Notes',
    heading: "Get last semester's books at 70% off.",
    sub: 'Buy from your seniors. Sell to your juniors.',
    cta: 'Find books',
    href: '/search?category=books',
    bg: 'from-rose-900 to-rose-700',
    accent: '#fda4af',
  },
] as const;

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Sell & buy what others need',
    desc: 'Post your unused items in under 60 seconds — photo, price, done. Browse listings from verified campus students.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Discover great deals',
    desc: 'Find study tables, appliances, books and more at student-friendly prices. Filter by category, condition, and seller area.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Chat instantly, close the deal',
    desc: 'Message sellers directly inside the app. No sharing numbers publicly. Safe, simple, and built for the CU student community.',
  },
] as const;

type LandingListing = Omit<Listing, 'profiles' | 'listing_images'> & {
  profiles?: {
    id: string;
    full_name: string;
    is_cu_verified: boolean;
  } | null;
  listing_images?: {
    url: string;
    position: number;
  }[];
};

interface LandingPageProps {
  trending: LandingListing[];
  studentCount: number;
  isAuthenticated: boolean;
}

export function LandingPage({ trending, studentCount, isAuthenticated }: LandingPageProps) {
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  function goTo(index: number) {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }

  const slide = BANNER_SLIDES[currentSlide];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    window.location.href = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
  }

  const displayCount =
    studentCount > 0 ? (studentCount >= 1000 ? `${(studentCount / 1000).toFixed(1)}k+` : `${studentCount}+`) : '100+';
  const browseHref = '/#browse';
  const howItWorksHref = '/#how-it-works';
  const searchHref = '/search';
  const loginHref = '/login';
  const sellHref = isAuthenticated ? '/listing/new' : '/login?next=%2Flisting%2Fnew';
  const slideHref = slide.cta === 'Post a listing' ? sellHref : slide.href;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      <div className="pt-14">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for study tables, books, laptops..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-28 text-sm shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-black px-4 text-xs font-medium text-white transition-colors hover:bg-gray-800"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`relative bg-gradient-to-br ${slide.bg} text-white transition-all duration-700`}
            style={{ height: '360px', minHeight: '360px' }}
          >
            <div
              className="mx-auto flex min-h-[360px] max-w-6xl flex-col justify-center px-6 py-8 md:py-12"
            >
              <div className="flex min-h-[160px] max-w-xl flex-col justify-between">
                <span
                  className="mb-6 inline-flex h-9 max-w-fit items-center rounded-full border px-4 text-xs font-semibold whitespace-nowrap"
                  style={{
                    background: `${slide.accent}25`,
                    color: slide.accent,
                    border: `1px solid ${slide.accent}40`,
                  }}
                >
                  {slide.tag}
                </span>
                <h2 className="mb-3 min-h-[56px] text-2xl font-bold leading-tight text-white md:min-h-[72px] md:text-3xl">
                  {slide.heading}
                </h2>
                <p className="mb-6 min-h-[40px] text-sm leading-relaxed text-white/70 md:min-h-[48px] md:text-base">
                  {slide.sub}
                </p>
                <Link
                  href={slideHref}
                  className="inline-flex h-10 w-[150px] md:w-[180px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: slide.accent, color: '#111' }}
                >
                  {slide.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'h-2 w-6 bg-white'
                      : 'h-2 w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => goTo((currentSlide - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)}
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => goTo((currentSlide + 1) % BANNER_SLIDES.length)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Next slide"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div id="browse" className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Popular on campus</h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([cat, label]) => (
              <Link
                key={cat}
                href={`/search?category=${cat}`}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <span className="text-xl md:text-3xl">{CATEGORY_ICONS[cat]}</span>
                <span className="text-center text-xs font-medium leading-tight text-gray-600 group-hover:text-gray-900">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {trending.length > 0 && (
          <div className="bg-gray-50 py-10">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <h2 className="text-lg font-semibold text-gray-900">Trending now</h2>
                  {trending.some((listing) => listing.is_featured) && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Admin picks
                    </span>
                  )}
                </div>
                <Link
                  href={searchHref}
                  className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800"
                >
                  View more <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {trending.slice(0, 8).map((listing) => {
                  const img = listing.listing_images?.[0]?.url;
                  const seller = listing.profiles;

                  return (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-gray-200 hover:shadow-md">
                        <div className="relative aspect-square bg-gray-100">
                          {img ? (
                            <Image
                              src={img}
                              alt={listing.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                              <span className="text-3xl">{CATEGORY_ICONS[listing.category]}</span>
                            </div>
                          )}
                          {listing.is_negotiable && (
                            <div className="absolute left-2 top-2">
                              <span className="rounded-full border border-gray-200 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                                Negotiable
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(listing.price)}
                          </p>
                          <p className="truncate text-xs leading-tight text-gray-600">
                            {listing.title}
                          </p>
                          <div className="flex items-center justify-between pt-0.5">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conditionColor(
                                listing.condition
                              )}`}
                            >
                              {CONDITION_LABELS[listing.condition]}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {timeAgo(listing.created_at)}
                            </span>
                          </div>
                          {seller && (
                            <div className="flex items-center gap-1 pt-1">
                              <span className="truncate text-[10px] text-gray-400">
                                {seller.full_name}
                              </span>
                              {seller.is_cu_verified && <VerifiedBadge size="sm" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div id="how-it-works" className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-10 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">How CUReSell works</h2>
            <p className="mt-2 text-sm text-gray-400">Three steps. No complexity.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ number, icon: Icon, title, desc }) => (
              <div
                key={number}
                className="group relative rounded-2xl bg-gray-50 p-6 transition-colors hover:bg-gray-100"
              >
                <div className="pointer-events-none absolute right-5 top-5 select-none text-5xl font-black text-gray-100 transition-colors group-hover:text-gray-200">
                  {number}
                </div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon size={18} />
                </div>
                <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-900">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={searchHref}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-black px-8 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Get started - it&apos;s free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="bg-black px-4 py-14 text-white">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-5xl font-black tracking-tight">{displayCount}</p>
            <p className="text-lg font-semibold text-white/90">students already on CUReSell</p>
            <p className="mx-auto max-w-sm text-sm text-white/50">
              Join your campus community. Buy smarter. Sell faster. No OLX chaos.
            </p>
            <Link
              href={loginHref}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Join now
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <footer className="border-t border-gray-100 bg-gray-50 px-4 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-bold text-gray-900">CUReSell</p>
            <p className="text-xs text-gray-400">
              Campus marketplace for Chandigarh University students
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link href={searchHref} className="hover:text-gray-600">
                Browse listings
              </Link>
              <Link href={loginHref} className="hover:text-gray-600">
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
