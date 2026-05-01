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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/85">
      <div className="app-container flex h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
            aria-label="CUReSell home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-sm font-black text-white shadow-sm dark:bg-white dark:text-gray-950">
              CU
            </span>
            <span className="hidden text-lg font-black tracking-tight text-gray-950 dark:text-white sm:inline">
              CUReSell
            </span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              {primaryLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-gray-100 text-gray-950 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
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
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/listing/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Sell</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-lg px-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/login?next=%2Flisting%2Fnew"
              className="inline-flex h-10 items-center rounded-lg bg-gray-950 px-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              Start selling
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
