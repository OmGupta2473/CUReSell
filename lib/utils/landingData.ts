import { createClient } from '@/lib/supabase/server';

function sortListingImages<T extends { listing_images?: { position: number }[] | null }>(listing: T) {
  return {
    ...listing,
    listing_images: listing.listing_images?.sort((a, b) => a.position - b.position) ?? [],
  };
}

export async function getLandingData() {
  const supabase = createClient();

  const [featuredResult, latestResult, countResult] = await Promise.all([
    supabase
      .from('listings')
      .select(`
        id, title, price, is_negotiable, category, condition,
        created_at, is_featured,
        profiles(id, full_name, is_cu_verified),
        listing_images(url, position)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),

    supabase
      .from('listings')
      .select(`
        id, title, price, is_negotiable, category, condition,
        created_at, is_featured,
        profiles(id, full_name, is_cu_verified),
        listing_images(url, position)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),

    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const featured = (featuredResult.data ?? []).map((listing: any) => sortListingImages(listing));
  const latest = (latestResult.data ?? []).map((listing: any) => sortListingImages(listing));
  const trending = [...featured];
  const seen = new Set(featured.map((listing: any) => listing.id));

  for (const listing of latest) {
    if (trending.length >= 8) break;
    if (seen.has(listing.id)) continue;
    trending.push(listing);
    seen.add(listing.id);
  }

  const studentCount = countResult.count ?? 0;

  return { trending, studentCount };
}
