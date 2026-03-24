import { Suspense } from 'react';
import { ListingGridSkeleton } from '@/components/listing/ListingGrid';
import { SearchPageClient } from './SearchPageClient';

interface SearchPageProps {
  searchParams?: {
    q?: string;
    category?: string;
    sort?: string;
    condition?: string;
    hostel?: string;
    department?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<ListingGridSkeleton />}>
      <SearchPageClient
        initialQuery={searchParams?.q ?? ''}
        initialCategory={searchParams?.category}
        initialSort={searchParams?.sort}
        initialCondition={searchParams?.condition}
        initialHostel={searchParams?.hostel}
        initialDepartment={searchParams?.department}
      />
    </Suspense>
  );
}
