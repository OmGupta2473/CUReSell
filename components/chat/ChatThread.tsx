'use client';

import { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMessages } from '@/lib/hooks/useMessages';
import { formatFullPrice } from '@/lib/utils/formatters';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import type { ListingImage, Profile } from '@/lib/types';

interface ChatThreadProps {
  conversation: {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    listings?: {
      id: string;
      title: string;
      price: number;
      status: string;
      listing_images?: ListingImage[];
    };
    buyer?: Profile;
    seller?: Profile;
  };
  currentUserId: string;
}

export function ChatThread({ conversation, currentUserId }: ChatThreadProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sendMessage, markAsRead } = useMessages(conversation.id);

  const otherUser = useMemo(
    () => (conversation.buyer_id === currentUserId ? conversation.seller : conversation.buyer),
    [conversation, currentUserId]
  );

  useEffect(() => {
    void markAsRead(currentUserId);
  }, [currentUserId, markAsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-24">
      <div className="sticky top-14 z-10 rounded-[24px] border border-gray-100 bg-white/95 p-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/messages')}
            className="rounded-xl p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {otherUser?.full_name ?? 'Conversation'}
            </p>
            <p className="truncate text-xs text-gray-500">
              about {conversation.listings?.title ?? 'this listing'}
            </p>
          </div>
        </div>

        {conversation.listings && (
          <Link
            href={`/listing/${conversation.listings.id}`}
            className="mt-3 flex items-center gap-3 rounded-2xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
              {conversation.listings.listing_images?.[0] ? (
                <Image
                  src={conversation.listings.listing_images[0].url}
                  alt={conversation.listings.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">📦</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {conversation.listings.title}
              </p>
              <p className="text-sm text-gray-600">{formatFullPrice(conversation.listings.price)}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
              {conversation.listings.status}
            </span>
          </Link>
        )}
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-gradient-to-b from-orange-50/40 to-white px-3 py-4 sm:px-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`h-14 animate-pulse rounded-3xl bg-gray-100 ${
                  index % 2 === 0 ? 'mr-12' : 'ml-12'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white p-4 pb-safe">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={(value) => sendMessage(value, currentUserId)} />
        </div>
      </div>
    </div>
  );
}
