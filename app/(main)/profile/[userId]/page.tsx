import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserListings } from '@/components/profile/UserListings';
import type { Listing, ListingImage, Profile } from '@/lib/types';

type ListingWithImages = Listing & {
  listing_images?: ListingImage[];
};

export default async function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = createClient();

  const [{ data: profile, error: profileError }, { data: listings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.userId).single(),
    supabase
      .from('listings')
      .select('*, listing_images (id, url, position, storage_path)')
      .eq('seller_id', params.userId)
      .in('status', ['active', 'sold'])
      .order('created_at', { ascending: false }),
  ]);

  if (profileError || !profile) {
    notFound();
  }

  const normalizedListings = ((listings as ListingWithImages[]) ?? []).map((listing) => ({
    ...listing,
    listing_images: listing.listing_images?.sort((a, b) => a.position - b.position) ?? [],
  }));

  const soldCount = normalizedListings.filter((listing) => listing.status === 'sold').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProfileHeader
        profile={profile as Profile}
        totalListings={normalizedListings.length}
        soldCount={soldCount}
      />
      <UserListings
        listings={normalizedListings}
        title={`${(profile as Profile).full_name.split(' ')[0]}'s listings`}
        allowFiltering={false}
      />
    </div>
  );
}
