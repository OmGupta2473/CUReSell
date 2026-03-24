'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatFullPrice, timeAgo } from '@/lib/utils/formatters';

interface ChatThreadProps {
  conversation: any;
  initialMessages: any[];
  currentUserId: string;
}

export function ChatThread({ conversation, initialMessages, currentUserId }: ChatThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [supabase] = useState(() => createClient());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isBuyer = conversation.buyer_id === currentUserId;
  const otherPerson = isBuyer ? conversation.seller : conversation.buyer;
  const listing = conversation.listings;
  const coverImage = listing?.listing_images
    ?.sort((a: any, b: any) => a.position - b.position)?.[0]?.url;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          if (payload.new.sender_id !== currentUserId) {
            const { data } = await supabase
              .from('messages')
              .select('*, profiles(id, full_name, avatar_url)')
              .eq('id', payload.new.id)
              .single();
            if (data) {
              setMessages((prev) => [...prev, data]);
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', payload.new.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId, supabase]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput('');

    const optimistic = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      profiles: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content,
    });

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    }
    setSending(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto -mx-3 md:mx-auto">
      <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors -ml-1"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {otherPerson?.avatar_url ? (
              <Image src={otherPerson.avatar_url} alt="" width={32} height={32} className="object-cover" />
            ) : (
              <span className="text-xs font-semibold text-gray-600">
                {otherPerson?.full_name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{otherPerson?.full_name ?? 'Unknown'}</p>
          </div>
        </div>
        {listing && (
          <Link href={`/listing/${conversation.listing_id}`} className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100">
              {coverImage && <Image src={coverImage} alt="" fill className="object-cover" />}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{listing.title}</p>
              <p className="text-xs text-gray-500">{formatFullPrice(listing.price)}</p>
            </div>
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Say hi! Ask about the item.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.sender_id === currentUserId;
          const showTime =
            i === 0 ||
            new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 300000;

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-[10px] text-gray-400 my-2">{timeAgo(msg.created_at)}</p>
              )}
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed
                    ${isOwn
                      ? 'bg-black text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-3 py-3 pb-safe">
        {listing?.status === 'sold' ? (
          <p className="text-center text-sm text-gray-400 py-1">This item has been sold</p>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              maxLength={1000}
              className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
