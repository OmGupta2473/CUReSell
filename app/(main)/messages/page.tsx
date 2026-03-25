import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InboxClient } from '@/components/chat/InboxList';

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at, listing_id, buyer_id, seller_id,
      listings (id, title, status, listing_images(url, position)),
      buyer:profiles!conversations_buyer_id_fkey (id, full_name, avatar_url),
      seller:profiles!conversations_seller_id_fkey (id, full_name, avatar_url),
      messages (id, content, sender_id, is_read, created_at)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  return <InboxClient conversations={conversations ?? []} currentUserId={user.id} />;
}
