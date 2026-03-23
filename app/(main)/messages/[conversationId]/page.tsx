import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatThread } from '@/components/chat/ChatThread';
import type { ListingImage, Profile } from '@/lib/types';

type ConversationDetail = {
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

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      *,
      listings (
        id,
        title,
        price,
        status,
        listing_images (id, url, position, storage_path)
      ),
      buyer:profiles!conversations_buyer_id_fkey (
        id,
        email,
        full_name,
        avatar_url,
        department,
        hostel_block,
        year_of_study,
        is_admin,
        created_at
      ),
      seller:profiles!conversations_seller_id_fkey (
        id,
        email,
        full_name,
        avatar_url,
        department,
        hostel_block,
        year_of_study,
        is_admin,
        created_at
      )
    `
    )
    .eq('id', params.conversationId)
    .single();

  if (error || !data) {
    notFound();
  }

  const conversation = data as ConversationDetail;

  if (conversation.listings?.listing_images) {
    conversation.listings.listing_images.sort((a, b) => a.position - b.position);
  }

  return <ChatThread conversation={conversation} currentUserId={user.id} />;
}
