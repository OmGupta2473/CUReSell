import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ListingDetail } from '@/components/listing/ListingDetail';

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles (id, full_name, avatar_url, hostel_block, department, year_of_study),
      listing_images (id, url, position, storage_path)
    `)
    .eq('id', params.id)
    .single();

  if (error || !listing) notFound();

  if (listing.listing_images) {
    listing.listing_images.sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    );
  }

  supabase
    .from('listings')
    .update({ view_count: (listing.view_count ?? 0) + 1 })
    .eq('id', params.id)
    .then(() => {});

  return <ListingDetail listing={listing} />;
}
