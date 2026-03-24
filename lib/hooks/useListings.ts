'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Category, Listing } from '@/lib/types';

interface UseListingsOptions {
  category?: Category | null;
  search?: string;
  sellerId?: string;
  status?: 'active' | 'sold' | 'expired';
  enabled?: boolean;
}

export function useListings({
  category,
  search,
  sellerId,
  status = 'active',
  enabled = true,
}: UseListingsOptions = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['listings', { category, search, sellerId, status }],
    queryFn: async (): Promise<Listing[]> => {
      let query = supabase
        .from('listings')
        .select(
          `
          *,
          profiles (id, full_name, avatar_url, hostel_block, department),
          listing_images (id, url, position, storage_path)
        `
        )
        .order('created_at', { ascending: false });

      if (status === 'active') {
        query = query.eq('status', 'active');
      } else if (status === 'sold') {
        query = query.eq('status', 'sold');
      } else {
        query = query.in('status', ['active', 'sold', 'expired']);
      }

      if (category) query = query.eq('category', category);
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
      }
      if (sellerId) query = query.eq('seller_id', sellerId);

      const { data, error } = await query;
      if (error) throw error;

      return (data as Listing[]).map((listing) => ({
        ...listing,
        listing_images: listing.listing_images?.sort((a, b) => a.position - b.position) ?? [],
      }));
    },
    enabled,
    staleTime: 30_000,
  });
}
