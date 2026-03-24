'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils/formatters';

interface InboxClientProps {
  conversations: any[];
  currentUserId: string;
}

export function InboxClient({ conversations, currentUserId }: InboxClientProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <MessageCircle size={40} className="text-gray-200" />
        <p className="font-medium text-gray-600">No messages yet</p>
        <p className="text-sm text-gray-400 text-center">
          When you chat with a seller,
          <br />
          your conversations appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 -mx-3">
      <h1 className="text-lg font-semibold px-3 mb-4">Messages</h1>
      {conversations.map((conv) => {
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
          <Link key={conv.id} href={`/messages/${conv.id}`}>
            <div className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {coverImage ? (
                  <Image src={coverImage} alt={listing?.title ?? ''} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold truncate">
                    {otherPerson?.full_name ?? 'Unknown'}
                  </p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {lastMessage ? timeAgo(lastMessage.created_at) : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {listing?.title ?? 'Listing'}
                </p>
                <p
                  className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
                >
                  {lastMessage
                    ? (lastMessage.sender_id === currentUserId ? 'You: ' : '') + lastMessage.content
                    : 'Start the conversation'}
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
