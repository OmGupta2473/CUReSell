'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/lib/types';

export function useMessages(conversationId: string) {
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(id, full_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages((data as Message[]) || []);
      setLoading(false);
    }

    if (conversationId) {
      void loadMessages();
    } else {
      setLoading(false);
    }

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(id, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => {
              if (prev.some((message) => message.id === data.id)) {
                return prev;
              }
              return [...prev, data as Message];
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const sendMessage = useCallback(
    async (content: string, senderId: string) => {
      const trimmed = content.trim();
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: trimmed,
        })
        .select('*, profiles(id, full_name, avatar_url)')
        .single();

      if (error) {
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
        throw error;
      }

      setMessages((prev) =>
        prev.map((message) => (message.id === optimisticId ? (data as Message) : message))
      );
    },
    [conversationId, supabase]
  );

  const markAsRead = useCallback(
    async (userId: string) => {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);
    },
    [conversationId, supabase]
  );

  return { messages, loading, sendMessage, markAsRead };
}
