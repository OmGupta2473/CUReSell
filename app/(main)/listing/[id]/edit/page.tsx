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
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="sticky top-16 z-20 -mx-4 border-b border-white/[0.08] bg-[rgb(var(--background))]/72 px-4 py-3 backdrop-blur-2xl md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href={`/listing/${params.id}`}
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label="Back to listing"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Edit listing
            </h1>
            <p className="text-sm text-slate-400">
              Update details, photos, price, and availability.
            </p>
          </div>
        </div>
      </div>

      <ListingForm mode="edit" initialListing={listing} />
    </div>
  );
}
