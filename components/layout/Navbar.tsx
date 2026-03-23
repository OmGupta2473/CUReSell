'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, PlusCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b border-orange-100/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-black tracking-tight text-gray-900">
            CUReSell
          </Link>
          <div className="hidden items-center gap-2 text-sm text-gray-500 md:flex">
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">
              Chandigarh University
            </span>
            <span>Second-hand, campus-only, verified students</span>
          </div>
        </div>

        {loading ? (
          <div className="hidden h-9 w-24 animate-pulse rounded-full bg-gray-100 md:block" />
        ) : user ? (
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/listing/new"
              className="mr-1 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              <PlusCircle size={16} />
              Sell
            </Link>
            <Link
              href="/messages"
              className={`rounded-lg p-2 transition-colors hover:bg-gray-100 ${
                pathname === '/messages' ? 'text-black' : 'text-gray-500'
              }`}
            >
              <MessageCircle size={20} />
            </Link>
            <Link
              href="/profile"
              className={`rounded-lg p-2 transition-colors hover:bg-gray-100 ${
                pathname === '/profile' ? 'text-black' : 'text-gray-500'
              }`}
            >
              <User size={20} />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 md:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Start selling
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
