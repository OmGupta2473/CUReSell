'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
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
import { CONDITION_LABELS, type Category, type Listing } from '@/lib/types';
import { conditionColor, formatPrice, timeAgo } from '@/lib/utils/formatters';

const CATEGORY_MARKERS: Record<Category, string> = {
  books: 'BK',
  electronics: 'EL',
  furniture: 'FR',
  kitchen: 'KT',
  clothes: 'CL',
  cycles: 'CY',
  sports: 'SP',
  other: 'OT',
};

const BANNER_SLIDES = [
  {
    tag: 'For final year students',
    heading: 'Leaving campus? Sell your stuff in minutes.',
    sub: 'Study tables, mattresses, kitchen items, and daily essentials find a new owner fast.',
    cta: 'Post a listing',
    href: '/login?next=%2Flisting%2Fnew',
    bg: 'https://res.cloudinary.com/dpzlctdso/image/upload/v1774453897/IMG_9296_xcvisz.jpg',
    accent: '#f59e0b',
  },
  {
    tag: 'For students moving in',
    heading: 'Set up your space for a fraction of the price.',
    sub: 'Buy quality second-hand items from verified CU students.',
    cta: 'Browse listings',
    href: '/search',
    bg: 'https://res.cloudinary.com/dpzlctdso/image/upload/v1774453897/IMG_9295_fhfhyd.jpg',
    accent: '#5eead4',
  },
  {
    tag: 'Electronics',
    heading: 'Calculators, laptops, lab equipment, all here.',
    sub: 'Trusted sellers, in-app chat, no OLX spam.',
    cta: 'See electronics',
    href: '/search?category=electronics',
    bg: 'https://res.cloudinary.com/dpzlctdso/image/upload/v1774453897/IMG_9294_mbt4jg.jpg',
    accent: '#a5b4fc',
  },
  {
    tag: 'Books & Notes',
    heading: "Get last semester's books at 70% off.",
    sub: 'Buy from your seniors. Sell to your juniors.',
    cta: 'Find books',
    href: '/search?category=books',
    bg: 'https://res.cloudinary.com/dpzlctdso/image/upload/v1774453897/IMG_9297_ckjhkw.jpg',
    accent: '#fda4af',
  },
] as const;

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Sell and buy what others need',
    desc: 'Post your unused items in under 60 seconds. Browse listings from verified campus students.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Discover great deals',
    desc: 'Find study tables, appliances, books and more at student-friendly prices.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Chat instantly, close the deal',
    desc: 'Message sellers directly inside the app. Safe, simple, and built for the CU student community.',
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
  const counterRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const boostedCount = studentCount + 82;
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) observer.observe(counterRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = boostedCount;
    const duration = 1200;
    const stepTime = 20;
    const step = Math.ceil((end - start) / (duration / stepTime));

    const timer = setInterval(() => {
      start += step;

      if (start >= end) {
        start = end;
        clearInterval(timer);
      }

      setAnimatedCount(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [boostedCount, isVisible]);

  const searchHref = '/search';
  const loginHref = '/login';
  const sellHref = isAuthenticated ? '/listing/new' : '/login?next=%2Flisting%2Fnew';
  const slideHref = slide.cta === 'Post a listing' ? sellHref : slide.href;

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-white">
      <Navbar />

      <div className="pt-16">
        <div className="border-b border-white/[0.08] bg-[rgb(var(--background))]/45 px-4 py-4 backdrop-blur-2xl">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for study tables, books, laptops..."
                className="h-12 w-full rounded-[1.4rem] border border-white/[0.1] bg-white/[0.06] pl-11 pr-28 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.2)] placeholder:text-slate-500 focus:border-[rgb(var(--focus))]/60 focus:outline-none focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] px-4 text-xs font-medium text-slate-950 shadow-[0_12px_24px_rgba(88,161,255,0.22)] transition-all hover:brightness-110"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <section
          className="relative overflow-hidden text-white transition-all duration-700"
          style={{
            backgroundImage: `url(${slide.bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '420px',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,9,14,0.84),rgba(7,9,14,0.48),rgba(7,9,14,0.78))]" />

          <div className="relative z-10 mx-auto flex min-h-[420px] max-w-6xl flex-col justify-center px-6 py-10 md:py-14">
            <div className="max-w-2xl space-y-5">
              <span
                className="inline-flex h-9 max-w-fit items-center whitespace-nowrap rounded-full border px-4 text-xs font-semibold backdrop-blur-xl"
                style={{
                  background: `${slide.accent}20`,
                  color: slide.accent,
                  borderColor: `${slide.accent}40`,
                }}
              >
                {slide.tag}
              </span>

              <h1 className="max-w-xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                {slide.heading}
              </h1>

              <p className="max-w-lg text-sm leading-7 text-white/72 md:text-base">
                {slide.sub}
              </p>

              <Link
                href={slideHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:scale-[1.01]"
                style={{ background: slide.accent, color: '#111' }}
              >
                {slide.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <button
            onClick={() => goTo((currentSlide - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)}
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-black/25 transition-colors hover:bg-white/[0.14]"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>

          <button
            onClick={() => goTo((currentSlide + 1) % BANNER_SLIDES.length)}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-black/25 transition-colors hover:bg-white/[0.14]"
            aria-label="Next slide"
          >
            <ChevronRight size={16} className="text-white" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/35 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {trending.length > 0 && (
          <section className="py-10">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sm">
                    +
                  </span>
                  <h2 className="text-lg font-semibold text-white">Trending now</h2>
                  {trending.some((listing) => listing.is_featured) && (
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/[0.12] px-2 py-0.5 text-xs font-medium text-amber-100">
                      Admin picks
                    </span>
                  )}
                </div>
                <Link
                  href={searchHref}
                  className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
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
                      <div className="glass-panel group overflow-hidden rounded-[1.5rem] transition-all hover:-translate-y-1 hover:border-white/[0.16]">
                        <div className="relative aspect-square bg-white/[0.05]">
                          {img ? (
                            <Image
                              src={img}
                              alt={listing.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="rounded-2xl bg-white/[0.08] px-3 py-2 text-sm font-black text-slate-100">
                                {CATEGORY_MARKERS[listing.category]}
                              </span>
                            </div>
                          )}
                          {listing.is_negotiable && (
                            <div className="absolute left-2 top-2">
                              <span className="rounded-full border border-white/[0.18] bg-black/35 px-1.5 py-0.5 text-[10px] font-medium text-slate-100 backdrop-blur-xl">
                                Negotiable
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="text-sm font-bold text-white">{formatPrice(listing.price)}</p>
                          <p className="truncate text-xs leading-tight text-slate-300">{listing.title}</p>
                          <div className="flex items-center justify-between pt-0.5">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conditionColor(
                                listing.condition
                              )}`}
                            >
                              {CONDITION_LABELS[listing.condition]}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {timeAgo(listing.created_at)}
                            </span>
                          </div>
                          {seller && (
                            <div className="flex items-center gap-1 pt-1">
                              <span className="truncate text-[10px] text-slate-500">
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
          </section>
        )}

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-white md:text-3xl">How CUReSell works</h2>
            <p className="mt-2 text-sm text-slate-400">Three steps. No complexity.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ number, icon: Icon, title, desc }) => (
              <div
                key={number}
                className="glass-panel-muted group relative rounded-[1.6rem] p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <div className="pointer-events-none absolute right-5 top-5 select-none text-5xl font-black text-white/[0.05] transition-colors group-hover:text-white/[0.08]">
                  {number}
                </div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] text-sky-100">
                  <Icon size={18} />
                </div>
                <h3 className="mb-2 text-sm font-semibold leading-snug text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={searchHref}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] px-8 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(88,161,255,0.3)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Get started - it&apos;s free
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <div
          ref={counterRef}
          className="mx-4 rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(10,12,18,0.96),rgba(15,18,26,0.92))] px-4 py-14 text-white shadow-[0_28px_70px_rgba(0,0,0,0.32)]"
        >
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-5xl font-black tracking-tight">{animatedCount}+</p>
            <p className="text-lg font-semibold text-white/90">students already on CUReSell</p>
            <p className="mx-auto max-w-sm text-sm text-white/60">
              Join your campus community. Buy smarter. Sell faster. No OLX chaos.
            </p>
            <Link
              href={loginHref}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(88,161,255,0.3)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Join now
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <BottomNav initialSignedIn={isAuthenticated} />

        <div className="h-20 md:hidden" />

        <footer className="mt-10 border-t border-white/[0.08] bg-[rgb(var(--background))]/45 px-4 py-8 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-bold text-white">CUReSell</p>
            <p className="text-xs text-slate-500">
              Campus marketplace for Chandigarh University students
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href={searchHref} className="hover:text-white">
                Browse listings
              </Link>
              <Link href={loginHref} className="hover:text-white">
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
