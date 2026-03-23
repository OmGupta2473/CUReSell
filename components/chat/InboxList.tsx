'use client';

import Image from 'next/image';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils/formatters';
import type { Conversation, ListingImage, Message, Profile } from '@/lib/types';

type InboxConversation = Conversation & {
  listings?: {
    id: string;
    title: string;
    price: number;
    status: string;
    listing_images?: ListingImage[];
  };
  buyer?: Profile;
  seller?: Profile;
  messages?: Message[];
};

interface InboxListProps {
  conversations: InboxConversation[];
  currentUserId: string;
}

export function InboxList({ conversations, currentUserId }: InboxListProps) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center">
        <div className="text-4xl">💬</div>
        <p className="mt-3 text-base font-semibold text-gray-900">No messages yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Start a chat from any listing and your conversations will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
      {conversations.map((conversation, index) => {
        const otherUser =
          conversation.buyer_id === currentUserId ? conversation.seller : conversation.buyer;
        const cover = conversation.listings?.listing_images?.[0];
        const orderedMessages = [...(conversation.messages ?? [])].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const lastMessage = orderedMessages.at(-1);
        const unreadCount = orderedMessages.filter(
          (message) => message.sender_id !== currentUserId && !message.is_read
        ).length;

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={`flex gap-3 p-4 transition-colors hover:bg-gray-50 ${
              index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
              {cover ? (
                <Image src={cover.url} alt={conversation.listings?.title ?? ''} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">📦</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {conversation.listings?.title ?? 'Listing conversation'}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    with {otherUser?.full_name ?? 'Campus seller'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-gray-400">
                    {timeAgo(conversation.last_message_at)}
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 truncate text-sm text-gray-600">
                {lastMessage?.content ?? 'Say hello to get the conversation started'}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
