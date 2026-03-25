import { CATEGORY_LABELS, CONDITION_LABELS, type Condition, type Listing } from '@/lib/types';

export type ListingSortOption =
  | 'newest'
  | 'oldest'
  | 'price_low'
  | 'price_high'
  | 'most_viewed';

export interface ListingFeedFilters {
  sort: ListingSortOption;
  condition: Condition | 'all';
  hostelBlock: string;
  department: string;
}

export const SORT_LABELS: Record<ListingSortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  price_low: 'Price: low to high',
  price_high: 'Price: high to low',
  most_viewed: 'Most viewed',
};

export const DEFAULT_LISTING_FEED_FILTERS: ListingFeedFilters = {
  sort: 'newest',
  condition: 'all',
  hostelBlock: '',
  department: '',
};

export function isValidSortOption(value?: string): value is ListingSortOption {
  return typeof value === 'string' && value in SORT_LABELS;
}

export function isValidConditionFilter(value?: string): value is Condition | 'all' {
  return value === 'all' || (typeof value === 'string' && value in CONDITION_LABELS);
}

export function getListingFilterOptions(listings: Listing[]) {
  const hostelBlocks = Array.from(
    new Set(
      listings
        .map((listing) => listing.profiles?.hostel_block?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));

  const departments = Array.from(
    new Set(
      listings
        .map((listing) => listing.profiles?.department?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));

  return { hostelBlocks, departments };
}

export function applyListingFeedFilters(
  listings: Listing[],
  filters: ListingFeedFilters
): Listing[] {
  const filtered = listings.filter((listing) => {
    if (filters.condition !== 'all' && listing.condition !== filters.condition) {
      return false;
    }

    if (filters.hostelBlock) {
      const listingHostel = listing.profiles?.hostel_block?.trim() ?? '';
      if (listingHostel !== filters.hostelBlock) {
        return false;
      }
    }

    if (filters.department) {
      const listingDepartment = listing.profiles?.department?.trim() ?? '';
      if (listingDepartment !== filters.department) {
        return false;
      }
    }

    return true;
  });

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'most_viewed':
        return (b.view_count ?? 0) - (a.view_count ?? 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
}

export function countActiveFeedFilters(filters: ListingFeedFilters) {
  let count = 0;

  if (filters.sort !== DEFAULT_LISTING_FEED_FILTERS.sort) count += 1;
  if (filters.condition !== DEFAULT_LISTING_FEED_FILTERS.condition) count += 1;
  if (filters.hostelBlock) count += 1;
  if (filters.department) count += 1;

  return count;
}

export { CATEGORY_LABELS, CONDITION_LABELS };
