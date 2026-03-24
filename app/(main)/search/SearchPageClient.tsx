'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { FeedControls } from '@/components/listing/FeedControls';
import { CategoryFilter } from '@/components/listing/CategoryFilter';
import { ListingGrid, ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { SearchBar } from '@/components/listing/SearchBar';
import { useAuth } from '@/lib/hooks/useAuth';
import { useListings } from '@/lib/hooks/useListings';
import { CATEGORY_LABELS, type Category } from '@/lib/types';
import {
  DEFAULT_LISTING_FEED_FILTERS,
  applyListingFeedFilters,
  countActiveFeedFilters,
  getListingFilterOptions,
  isValidConditionFilter,
  isValidSortOption,
  type ListingFeedFilters,
} from '@/lib/utils/listingFeed';

function parseCategory(value?: string): Category | null {
  if (!value) return null;

  return value in CATEGORY_LABELS ? (value as Category) : null;
}

interface SearchPageClientProps {
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: string;
  initialCondition?: string;
  initialHostel?: string;
  initialDepartment?: string;
}

export function SearchPageClient({
  initialQuery = '',
  initialCategory,
  initialSort,
  initialCondition,
  initialHostel,
  initialDepartment,
}: SearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useAuth();

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<Category | null>(parseCategory(initialCategory));
  const [filters, setFilters] = useState<ListingFeedFilters>({
    sort: isValidSortOption(initialSort) ? initialSort : DEFAULT_LISTING_FEED_FILTERS.sort,
    condition: isValidConditionFilter(initialCondition)
      ? initialCondition
      : DEFAULT_LISTING_FEED_FILTERS.condition,
    hostelBlock: initialHostel ?? '',
    department: initialDepartment ?? '',
  });

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategory(parseCategory(initialCategory));
  }, [initialCategory]);

  useEffect(() => {
    setFilters({
      sort: isValidSortOption(initialSort) ? initialSort : DEFAULT_LISTING_FEED_FILTERS.sort,
      condition: isValidConditionFilter(initialCondition)
        ? initialCondition
        : DEFAULT_LISTING_FEED_FILTERS.condition,
      hostelBlock: initialHostel ?? '',
      department: initialDepartment ?? '',
    });
  }, [initialCondition, initialDepartment, initialHostel, initialSort]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      nextParams.set('q', trimmedSearch);
    }

    if (category) {
      nextParams.set('category', category);
    }

    if (filters.sort !== DEFAULT_LISTING_FEED_FILTERS.sort) {
      nextParams.set('sort', filters.sort);
    }

    if (filters.condition !== DEFAULT_LISTING_FEED_FILTERS.condition) {
      nextParams.set('condition', filters.condition);
    }

    if (filters.hostelBlock) {
      nextParams.set('hostel', filters.hostelBlock);
    }

    if (filters.department) {
      nextParams.set('department', filters.department);
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [category, filters, pathname, router, search]);

  const deferredSearch = useDeferredValue(search.trim());
  const { data: listings, isLoading, error } = useListings({
    category,
    search: deferredSearch,
    enabled: !!user,
  });

  const filterOptions = useMemo(() => getListingFilterOptions(listings ?? []), [listings]);
  const filteredListings = useMemo(
    () => applyListingFeedFilters(listings ?? [], filters),
    [filters, listings]
  );
  const activeFilterLabel = useMemo(() => {
    if (!category) return 'All categories';
    return CATEGORY_LABELS[category];
  }, [category]);
  const activeFilterCount = countActiveFeedFilters(filters);

  if (authLoading) {
    return <ListingGridSkeleton />;
  }

  const hasActiveFilters = Boolean(search.trim() || category || activeFilterCount > 0);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-amber-50 p-5 shadow-[0_18px_50px_-38px_rgba(0,0,0,0.35)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              <Compass size={14} />
              Search campus listings
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
                Find the right second-hand deal faster.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Search across live listings, narrow by category, and jump straight into the item
                you need before someone else grabs it.
              </p>
            </div>
          </div>

          <Link
            href="/listing/new"
            className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Post your item
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search for study tables, cycles, kettles, notes..."
          />
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>
      </section>

      <section className="rounded-[24px] border border-gray-100 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Search results</p>
            <p className="mt-1 text-sm text-gray-500">
              {category ? `${activeFilterLabel} selected` : 'Browsing across every category'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
            <SlidersHorizontal size={14} />
            {search.trim() ? `Query: "${search.trim()}"` : 'No keyword filter'}
          </div>
        </div>

        <div className="mt-4">
          <FeedControls
            filters={filters}
            onChange={setFilters}
            hostelOptions={filterOptions.hostelBlocks}
            departmentOptions={filterOptions.departments}
            resultCount={filteredListings.length}
            activeFilterCount={activeFilterCount}
            primaryLocationLabel={profile?.hostel_block ?? null}
          />
        </div>

        {isLoading && (
          <div className="mt-5">
            <ListingGridSkeleton />
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-8 text-center">
            <p className="text-sm text-red-700">Search failed to load. Please refresh and try again.</p>
          </div>
        )}

        {!isLoading && !error && filteredListings.length > 0 && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-500">
              {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
            </p>
            <ListingGrid listings={filteredListings} />
          </div>
        )}

        {!isLoading && !error && listings && filteredListings.length === 0 && (
          <div className="mt-6 rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
              <SearchIcon size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">No matching listings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {hasActiveFilters
                ? 'Try a broader keyword, switch categories, or clear filters to explore more items.'
                : 'There are no active listings yet. Be the first student to post something useful.'}
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCategory(null);
                    setFilters(DEFAULT_LISTING_FEED_FILTERS);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => router.push('/listing/new')}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Post a listing
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
