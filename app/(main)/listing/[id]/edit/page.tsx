import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ListingForm } from '@/components/listing/ListingForm';
import { createClient } from '@/lib/supabase/server';

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      listing_images (id, url, position, storage_path)
    `
    )
    .eq('id', params.id)
    .eq('seller_id', user.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  if (listing.listing_images) {
    listing.listing_images.sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="sticky top-14 z-10 mb-6 flex items-center gap-3 bg-gray-50 py-3">
        <Link
          href={`/listing/${params.id}`}
          className="-ml-2 rounded-xl p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">Edit listing</h1>
      </div>
      <ListingForm mode="edit" initialListing={listing} />
    </div>
  );
}
