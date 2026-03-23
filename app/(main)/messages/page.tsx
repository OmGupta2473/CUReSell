import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InboxList } from '@/components/chat/InboxList';
import type { Conversation, ListingImage, Message, Profile } from '@/lib/types';

type ConversationWithRelations = Conversation & {
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

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data } = await supabase
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
      ),
      messages (
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        created_at
      )
    `
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  const conversations = ((data as ConversationWithRelations[]) ?? []).map((conversation) => ({
    ...conversation,
    listings: conversation.listings
      ? {
          ...conversation.listings,
          listing_images:
            conversation.listings.listing_images?.sort((a, b) => a.position - b.position) ?? [],
        }
      : undefined,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-[28px] bg-gradient-to-br from-orange-100 via-amber-50 to-white px-5 py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
          Messages
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Stay close to the deal</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Ask about condition, pickup spots, and timing. Every conversation stays inside your
          verified campus network.
        </p>
      </div>

      <InboxList conversations={conversations} currentUserId={user.id} />
    </div>
  );
}
