import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserListings } from '@/components/profile/UserListings';
import type { Listing, ListingImage, Profile } from '@/lib/types';

type ListingWithImages = Listing & {
  listing_images?: ListingImage[];
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('listings')
      .select('*, listing_images (id, url, position, storage_path)')
      .eq('seller_id', user.id)
      .in('status', ['active', 'sold', 'expired'])
      .order('created_at', { ascending: false }),
  ]);

  const normalizedListings = ((listings as ListingWithImages[]) ?? []).map((listing) => ({
    ...listing,
    listing_images: listing.listing_images?.sort((a, b) => a.position - b.position) ?? [],
  }));

  const soldCount = normalizedListings.filter((listing) => listing.status === 'sold').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProfileHeader
        profile={profile as Profile}
        isOwnProfile
        totalListings={normalizedListings.length}
        soldCount={soldCount}
      />
      <UserListings listings={normalizedListings} title="My listings" />
    </div>
  );
}
