import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChatThread } from '@/components/chat/ChatThread';
import type { Message, Profile } from '@/lib/types';

type ChatConversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listings?: {
    id: string;
    title: string;
    status: string;
    price: number;
    is_negotiable: boolean;
    listing_images: { url: string; position: number }[];
  };
  buyer?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  seller?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
};

export default async function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id, listing_id, buyer_id, seller_id,
      listings (id, title, status, price, is_negotiable,
        listing_images(url, position)),
      buyer:profiles!conversations_buyer_id_fkey (id, full_name, avatar_url),
      seller:profiles!conversations_seller_id_fkey (id, full_name, avatar_url)
    `)
    .eq('id', params.conversationId)
    .single();

  if (!conversation) notFound();

  const normalizedConversation = {
    ...conversation,
    listings: Array.isArray(conversation.listings)
      ? conversation.listings[0]
      : conversation.listings,
    buyer: Array.isArray(conversation.buyer) ? conversation.buyer[0] : conversation.buyer,
    seller: Array.isArray(conversation.seller) ? conversation.seller[0] : conversation.seller,
  } as ChatConversation;

  if (
    normalizedConversation.buyer_id !== user.id &&
    normalizedConversation.seller_id !== user.id
  ) {
    redirect('/messages');
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('conversation_id', params.conversationId)
    .order('created_at', { ascending: true });

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', params.conversationId)
    .neq('sender_id', user.id);

  return (
    <ChatThread
      conversation={normalizedConversation}
      initialMessages={(messages ?? []) as Message[]}
      currentUserId={user.id}
    />
  );
}
