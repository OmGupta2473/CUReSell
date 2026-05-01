import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ListingForm } from '@/components/listing/ListingForm';

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="sticky top-16 z-20 -mx-4 border-b border-gray-200 bg-[rgb(var(--background))]/95 px-4 py-3 backdrop-blur-xl dark:border-gray-800 md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/"
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-gray-950 dark:text-white">
              Post a listing
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add photos, set a fair price, and publish to campus.
            </p>
          </div>
        </div>
      </div>

      <ListingForm mode="create" />
    </div>
  );
}
