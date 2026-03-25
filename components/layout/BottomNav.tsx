'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

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
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white md:hidden">
      <div className="flex h-14 items-center justify-around">
        {links.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex h-full flex-1 flex-col items-center justify-center gap-0.5"
            >
              <Icon
                size={accent ? 28 : 22}
                className={accent ? 'text-black' : active ? 'text-black' : 'text-gray-400'}
                strokeWidth={accent ? 2 : active ? 2 : 1.5}
              />
              <span
                className={`text-[10px] ${
                  accent ? 'font-medium text-black' : active ? 'text-black' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
