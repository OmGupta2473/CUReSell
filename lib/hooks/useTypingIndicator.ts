'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook that manages typing indicator state for a chat conversation.
 *
 * - Upserts `is_typing: true` when the user types
 * - Debounces `is_typing: false` after 2 seconds of inactivity
 * - Listens for realtime updates from the other participant
 * - Cleans up on unmount
 */
export function useTypingIndicator(
  conversationId: string,
  currentUserId: string,
  otherPersonName: string
) {
  const [supabase] = useState(() => createClient());
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherTypingName, setOtherTypingName] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Upsert own typing status
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      await supabase.from('typing_status').upsert(
        {
          user_id: currentUserId,
          conversation_id: conversationId,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,conversation_id' }
      );
    },
    [supabase, currentUserId, conversationId]
  );

  // Called on every keystroke in the input
  const handleTyping = useCallback(() => {
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Set typing to true
    void setTyping(true);

    // After 2s of no typing, set to false
    debounceRef.current = setTimeout(() => {
      void setTyping(false);
    }, 2000);
  }, [setTyping]);

  // Realtime listener for the other person's typing status
  useEffect(() => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            user_id: string;
            is_typing: boolean;
          };
          // Only care about the other person
          if (row.user_id !== currentUserId) {
            setIsOtherTyping(row.is_typing);
            if (row.is_typing) {
              setOtherTypingName(otherPersonName);
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, currentUserId, otherPersonName]);

  // Cleanup: mark as not typing when unmounting
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void setTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isOtherTyping, otherTypingName, handleTyping };
}
