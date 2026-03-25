import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileView } from '@/components/profile/ProfileHeader';

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (!profile) notFound();

  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(url, position)')
    .eq('seller_id', params.userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const isOwnProfile = user?.id === params.userId;

  return <ProfileView profile={profile} listings={listings ?? []} isOwnProfile={isOwnProfile} />;
}
