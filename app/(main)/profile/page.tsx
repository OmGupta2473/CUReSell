import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileView } from '@/components/profile/ProfileHeader';

export default async function MyProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(url, position)')
    .eq('seller_id', user.id)
    .in('status', ['active', 'sold'])
    .order('created_at', { ascending: false });

  return <ProfileView profile={profile} listings={listings ?? []} isOwnProfile={true} />;
}
