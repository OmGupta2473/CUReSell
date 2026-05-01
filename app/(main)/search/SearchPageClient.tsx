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
    const timeout = window.setTimeout(() => {
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
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [category, filters, pathname, router, search]);

  const deferredSearch = useDeferredValue(search.trim());
  const { data: listings, isLoading, error } = useListings({
    category,
    search: deferredSearch,
    enabled: true, // Allow public users to see listings
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
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Compass size={14} />
              Search campus listings
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white md:text-3xl">
                Find the right second-hand deal faster.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Search across live listings, narrow by category, and jump straight into the item
                you need before someone else grabs it.
              </p>
            </div>
          </div>

          <Link
            href="/listing/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
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

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-gray-950 dark:text-white">Search results</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {category ? `${activeFilterLabel} selected` : 'Browsing across every category'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
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
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center dark:border-red-900/60 dark:bg-red-950/40">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Search failed to load. Please refresh and try again.</p>
          </div>
        )}

        {!isLoading && !error && filteredListings.length > 0 && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
            </p>
            <ListingGrid listings={filteredListings} />
          </div>
        )}

        {!isLoading && !error && listings && filteredListings.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-14 text-center dark:border-gray-700 dark:bg-gray-950">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm dark:bg-gray-900 dark:text-gray-400">
              <SearchIcon size={22} />
            </div>
            <h2 className="mt-4 text-lg font-black text-gray-950 dark:text-white">No matching listings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
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
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => router.push('/listing/new')}
                className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950"
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
