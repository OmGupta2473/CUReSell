'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

interface BottomNavProps {
  initialSignedIn?: boolean;
}

type BottomNavLink = {
  href: string;
  icon: typeof Home;
  label: string;
  accent?: boolean;
  isActive: (pathname: string) => boolean;
};

function buildBottomNavLinks(isSignedIn: boolean): BottomNavLink[] {
  return [
    {
      href: isSignedIn ? '/feed' : '/',
      icon: Home,
      label: 'Home',
      isActive: (pathname) => pathname === '/' || pathname === '/feed',
    },
    {
      href: '/search',
      icon: Search,
      label: 'Search',
      isActive: (pathname) => pathname.startsWith('/search'),
    },
    {
      href: isSignedIn ? '/listing/new' : '/login?next=%2Flisting%2Fnew',
      icon: PlusCircle,
      label: 'Post',
      accent: true,
      isActive: (pathname) => pathname.startsWith('/listing/new'),
    },
    {
      href: isSignedIn ? '/messages' : '/login?next=%2Fmessages',
      icon: MessageCircle,
      label: 'Messages',
      isActive: (pathname) => pathname.startsWith('/messages'),
    },
    {
      href: isSignedIn ? '/profile' : '/login?next=%2Fprofile',
      icon: User,
      label: 'Profile',
      isActive: (pathname) => pathname === '/profile' || pathname.startsWith('/profile/'),
    },
  ];
}

export function BottomNav({ initialSignedIn = false }: BottomNavProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isSignedIn = loading ? initialSignedIn : Boolean(user);
  const links = buildBottomNavLinks(isSignedIn);

  return (
    <nav
      className="safe-bottom fixed bottom-3 left-3 right-3 z-50 rounded-[1.75rem] border border-white/[0.1] bg-[rgb(var(--background-elevated))]/80 shadow-[0_20px_50px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:hidden"
      aria-label="Primary mobile navigation"
    >
      <div className="grid h-[4.5rem] grid-cols-5 items-center px-1.5">
        {links.map(({ href, icon: Icon, label, accent, isActive }) => {
          const active = isActive(pathname);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition-all duration-300',
                active ? 'text-white' : 'text-slate-400',
                accent && 'text-sky-200'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-2xl transition-all duration-300',
                  accent
                    ? 'h-10 w-10 bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] text-slate-950 shadow-[0_16px_36px_rgba(88,161,255,0.28)]'
                    : active
                      ? 'h-9 w-11 bg-white/[0.1]'
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
