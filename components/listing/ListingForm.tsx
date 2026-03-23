'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { listingSchema, type ListingFormValues } from '@/lib/validations/listing';
import { uploadListingImage } from '@/lib/utils/imageCompression';
import { ImageUploader } from './ImageUploader';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  type Category,
  type Condition,
} from '@/lib/types';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];
const CONDITIONS: [Condition, string, string][] = [
  ['like_new', 'Like New', 'Barely used, almost perfect'],
  ['good', 'Good', 'Minor signs of use'],
  ['fair', 'Fair', 'Visible wear but works fine'],
];

export function ListingForm() {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { is_negotiable: false },
  });

  const selectedCategory = watch('category');
  const selectedCondition = watch('condition');
  const isNegotiable = watch('is_negotiable');

  async function onSubmit(values: ListingFormValues) {
    if (images.length === 0) {
      setImageError('Please add at least one photo');
      return;
    }
    setImageError('');
    setSubmitting(true);
    setSubmitError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          title: values.title.trim(),
          description: values.description?.trim() || null,
          price: parseInt(values.priceInput) * 100,
          is_negotiable: values.is_negotiable,
          category: values.category,
          condition: values.condition,
          status: 'active',
        })
        .select('id')
        .single();

      if (listingError) throw listingError;

      const imageInserts = [];
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(Math.round((i / images.length) * 100));
        const { url, storage_path } = await uploadListingImage(
          supabase,
          images[i],
          listing.id,
          i + 1
        );
        imageInserts.push({
          listing_id: listing.id,
          url,
          storage_path,
          position: i + 1,
        });
      }
      setUploadProgress(100);

      const { error: imgError } = await supabase.from('listing_images').insert(imageInserts);

      if (imgError) throw imgError;

      router.push(`/listing/${listing.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      setSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-8">
      <ImageUploader files={images} onChange={setImages} error={imageError} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          placeholder="e.g. Study table with chair"
          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('category', value, { shouldValidate: true })}
              className={`py-2 px-1 rounded-xl text-xs font-medium border transition-colors text-center
                ${selectedCategory === value
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Condition <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {CONDITIONS.map(([value, label, desc]) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('condition', value, { shouldValidate: true })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors
                ${selectedCondition === value
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p
                  className={`mt-0.5 text-xs ${
                    selectedCondition === value ? 'text-gray-300' : 'text-gray-400'
                  }`}
                >
                  {desc}
                </p>
              </div>
              <div
                className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                  selectedCondition === value ? 'border-white bg-white' : 'border-gray-300'
                }`}
              >
                {selectedCondition === value && (
                  <div className="h-full w-full scale-50 rounded-full bg-black" />
                )}
              </div>
            </button>
          ))}
        </div>
        {errors.condition && <p className="text-xs text-red-500">{errors.condition.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
            ₹
          </span>
          <input
            {...register('priceInput')}
            type="text"
            inputMode="numeric"
            placeholder="0"
            className="h-10 w-full rounded-lg border border-gray-200 pl-7 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        {errors.priceInput && (
          <p className="text-xs text-red-500">{errors.priceInput.message}</p>
        )}

        <label className="mt-2 flex cursor-pointer items-center gap-2.5">
          <div
            onClick={() => setValue('is_negotiable', !isNegotiable)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              isNegotiable ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isNegotiable ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm text-gray-600">Open to offers</span>
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Description
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          placeholder="Describe the item — age, any defects, reason for selling…"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      {submitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading photos…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-black transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Saving…'}
          </>
        ) : (
          'Post listing'
        )}
      </button>
    </form>
  );
}
