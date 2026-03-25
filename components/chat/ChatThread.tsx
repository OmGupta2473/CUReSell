'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatFullPrice, timeAgo } from '@/lib/utils/formatters';
import { useTypingIndicator } from '@/lib/hooks/useTypingIndicator';

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

  // --- Typing indicator ---
  const { isOtherTyping, otherTypingName, handleTyping } = useTypingIndicator(
    conversation.id,
    currentUserId,
    otherPerson?.full_name ?? 'Someone'
  );

  // --- Auto-scroll to latest message ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  // --- Mark incoming messages as read ---
  const markIncomingAsRead = useCallback(
    async (messageId: string) => {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);
    },
    [supabase]
  );

  // --- Realtime: new messages (INSERT) + read status updates (UPDATE) ---
  useEffect(() => {
    // Listen for new messages
    const insertChannel = supabase
      .channel(`chat-insert:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          // Only process messages from the other user (own messages are added optimistically)
          if (payload.new.sender_id !== currentUserId) {
            const { data } = await supabase
              .from('messages')
              .select('*, profiles(id, full_name, avatar_url)')
              .eq('id', payload.new.id)
              .single();
            if (data) {
              setMessages((prev) => {
                // Dedup: skip if already present
                if (prev.some((m) => m.id === data.id)) return prev;
                return [...prev, data];
              });
              // Auto-mark as read since the user is in the conversation
              await markIncomingAsRead(data.id);
            }
          }
        }
      )
      .subscribe();

    // Listen for message updates (read receipts)
    const updateChannel = supabase
      .channel(`chat-update:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; is_read: boolean; read_at: string };
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id
                ? { ...m, is_read: updated.is_read, read_at: updated.read_at }
                : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [conversation.id, currentUserId, supabase, markIncomingAsRead]);

  // --- Send message ---
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
      read_at: null,
      created_at: new Date().toISOString(),
      profiles: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content,
      })
      .select('*, profiles(id, full_name, avatar_url)')
      .single();

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } else if (data) {
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? data : m))
      );
    }
    setSending(false);
    inputRef.current?.focus();
  }

  // --- Read receipt ticks ---
  function ReadTicks({ message }: { message: any }) {
    if (message.sender_id !== currentUserId) return null;

    // Optimistic (temp) messages — single gray tick
    if (String(message.id).startsWith('temp-')) {
      return <Check size={14} className="text-gray-400" />;
    }

    if (message.is_read) {
      // Read — double blue ticks
      return <CheckCheck size={14} className="text-blue-500" />;
    }

    // Sent but not read — single gray tick
    return <Check size={14} className="text-gray-400" />;
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden max-w-lg mx-auto w-full">
      {/* --- Header --- */}
      <div className="flex-none flex items-center gap-3 px-3 py-3 border-b border-gray-100 bg-white">
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
            {isOtherTyping && (
              <p className="text-[11px] text-green-600 font-medium animate-pulse">typing...</p>
            )}
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

      {/* --- Messages --- */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Say hi! Ask about the item.</p>
          </div>
        )}
        {messages.map((msg: any, i: number) => {
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
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className={`flex items-center gap-1 justify-end mt-0.5 ${isOwn ? 'text-gray-300' : 'text-gray-400'}`}>
                    <span className="text-[10px]">
                      {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <ReadTicks message={msg} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* --- Input --- */}
      <div className="flex-none border-t border-gray-100 bg-white p-4">
        {listing?.status === 'sold' ? (
          <p className="text-center text-sm text-gray-400 py-1">This item has been sold</p>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
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
