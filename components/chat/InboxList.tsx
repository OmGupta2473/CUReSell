'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon, MessageCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface InboxClientProps {
  conversations: any[];
  currentUserId: string;
}

export function InboxClient({ conversations, currentUserId }: InboxClientProps) {
  if (conversations.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
        <MessageCircle size={40} className="text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-lg font-black text-gray-950 dark:text-white">No messages yet</p>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          When you chat with a seller or buyer, your conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">
          Messages
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Keep track of item questions, pickup details, and deal updates.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {conversations.map((conv, index) => {
          const isBuyer = conv.buyer_id === currentUserId;
          const otherPerson = isBuyer ? conv.seller : conv.buyer;
          const listing = conv.listings;
          const sortedImages = listing?.listing_images?.sort(
            (a: any, b: any) => a.position - b.position
          );
          const coverImage = sortedImages?.[0]?.url;

          const sortedMessages = [...(conv.messages ?? [])].sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const lastMessage = sortedMessages[0];
          const unreadCount = (conv.messages ?? []).filter(
            (m: any) => !m.is_read && m.sender_id !== currentUserId
          ).length;

          return (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className={cn(
                'flex items-center gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60',
                index > 0 && 'border-t border-gray-100 dark:border-gray-800'
              )}
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                {coverImage ? (
                  <Image src={coverImage} alt={listing?.title ?? 'Listing'} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                    <ImageIcon size={22} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-black text-gray-950 dark:text-white">
                    {otherPerson?.full_name ?? 'Unknown'}
                  </p>
                  <span className="flex-shrink-0 text-[11px] font-medium text-gray-400">
                    {lastMessage ? timeAgo(lastMessage.created_at) : ''}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {listing?.title ?? 'Listing'}
                </p>
                <p
                  className={cn(
                    'mt-1 truncate text-sm',
                    unreadCount > 0
                      ? 'font-bold text-gray-950 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {lastMessage
                    ? (lastMessage.sender_id === currentUserId ? 'You: ' : '') + lastMessage.content
                    : 'Start the conversation'}
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-black text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
