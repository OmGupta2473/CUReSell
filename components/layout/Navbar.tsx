'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, PlusCircle, Search, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

const primaryLinks = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  function isActive(href: string) {
    return pathname === href || (href !== '/feed' && pathname.startsWith(href));
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-[rgb(var(--background))]/60 backdrop-blur-2xl">
      <div className="app-container flex h-[4.5rem] items-center justify-between gap-3 py-3">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--focus))]"
            aria-label="CUReSell home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] text-sm font-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.12]">
              CU
            </span>
            <span className="hidden text-lg font-black tracking-tight text-white sm:inline">
              CUReSell
            </span>
          </Link>

          {user && (
            <nav className="glass-panel hidden items-center gap-1 rounded-2xl px-1.5 py-1.5 md:flex" aria-label="Primary navigation">
              {primaryLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-all duration-300',
                      active
                        ? 'bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                        : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
                    )}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {loading ? (
          <div className="h-10 w-28 animate-pulse rounded-2xl bg-white/[0.08]" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/listing/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,rgba(138,194,255,0.98),rgba(88,161,255,0.94))] px-4 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(88,161,255,0.32)] transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--focus))]"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Sell</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-2xl px-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/login?next=%2Flisting%2Fnew"
              className="inline-flex h-11 items-center rounded-2xl bg-white/[0.08] px-4 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.1] transition-all hover:-translate-y-0.5 hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--focus))]"
            >
              Start selling
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
