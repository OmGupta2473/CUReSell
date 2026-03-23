import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ListingForm } from '@/components/listing/ListingForm';

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="sticky top-14 z-10 mb-6 flex items-center gap-3 bg-gray-50 py-3">
        <Link
          href="/"
          className="-ml-2 rounded-xl p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">Post a listing</h1>
      </div>
      <ListingForm />
    </div>
  );
}
