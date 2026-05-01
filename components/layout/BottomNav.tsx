'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

export function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  const links = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/listing/new', icon: PlusCircle, label: 'Post', accent: true },
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90 md:hidden"
      aria-label="Primary mobile navigation"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {links.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors',
                active ? 'text-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400',
                accent && 'text-emerald-700 dark:text-emerald-300'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-lg transition-colors',
                  accent
                    ? 'h-9 w-9 bg-emerald-500 text-white shadow-sm'
                    : active
                      ? 'h-8 w-10 bg-gray-100 dark:bg-gray-800'
                      : 'h-8 w-10'
                )}
              >
                <Icon size={accent ? 22 : 20} strokeWidth={active || accent ? 2.25 : 1.8} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
