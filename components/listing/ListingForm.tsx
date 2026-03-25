'use client';

import { useState } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { listingSchema, type ListingFormValues } from '@/lib/validations/listing';
import { uploadListingImage } from '@/lib/utils/imageCompression';
import { ImageUploader, mapListingImagesToUploadItems, type ImageUploadItem } from './ImageUploader';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  type Category,
  type Condition,
  type Listing,
} from '@/lib/types';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];
const CONDITIONS: [Condition, string, string][] = [
  ['like_new', 'Like New', 'Barely used, almost perfect'],
  ['good', 'Good', 'Minor signs of use'],
  ['fair', 'Fair', 'Visible wear but works fine'],
];

interface ListingFormProps {
  mode?: 'create' | 'edit';
  initialListing?: Listing;
}

function getDefaultValues(initialListing?: Listing): DefaultValues<ListingFormValues> {
  if (!initialListing) {
    return { is_negotiable: false };
  }

  return {
    title: initialListing.title,
    description: initialListing.description ?? '',
    priceInput: String(Math.round(initialListing.price / 100)),
    is_negotiable: initialListing.is_negotiable,
    category: initialListing.category,
    condition: initialListing.condition,
  };
}

export function ListingForm({ mode = 'create', initialListing }: ListingFormProps) {
  const [images, setImages] = useState<ImageUploadItem[]>(
    mapListingImagesToUploadItems(initialListing?.listing_images ?? [])
  );
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
    defaultValues: getDefaultValues(initialListing),
  });

  const selectedCategory = watch('category');
  const selectedCondition = watch('condition');
  const isNegotiable = watch('is_negotiable');
  const isEditing = mode === 'edit' && Boolean(initialListing);

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

      const listingPayload = {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        price: parseInt(values.priceInput, 10) * 100,
        is_negotiable: values.is_negotiable,
        category: values.category,
        condition: values.condition,
      };

      let listingId = initialListing?.id;

      if (isEditing) {
        if (!initialListing) throw new Error('Listing not found');
        if (initialListing.seller_id !== user.id) throw new Error('You can only edit your own listing');

        const { error: listingError } = await supabase
          .from('listings')
          .update(listingPayload)
          .eq('id', initialListing.id)
          .eq('seller_id', user.id);

        if (listingError) throw listingError;
      } else {
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .insert({
            seller_id: user.id,
            ...listingPayload,
            status: 'active',
          })
          .select('id')
          .single();

        if (listingError) throw listingError;
        listingId = listing.id;
      }

      if (!listingId) throw new Error('Unable to save listing');

      const existingImages = images.filter(
        (image): image is Extract<ImageUploadItem, { kind: 'existing' }> => image.kind === 'existing'
      );
      const newImages = images.filter(
        (image): image is Extract<ImageUploadItem, { kind: 'new' }> => image.kind === 'new'
      );

      if (isEditing && initialListing) {
        const removedImages = (initialListing.listing_images ?? []).filter(
          (existingImage) => !existingImages.some((image) => image.id === existingImage.id)
        );

        if (removedImages.length > 0) {
          const storagePaths = removedImages
            .map((image) => image.storage_path)
            .filter((path): path is string => Boolean(path));

          if (storagePaths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('listing-images')
              .remove(storagePaths);

            if (storageError) throw storageError;
          }

          const { error: deleteImagesError } = await supabase
            .from('listing_images')
            .delete()
            .in('id', removedImages.map((image) => image.id));

          if (deleteImagesError) throw deleteImagesError;
        }

        for (let index = 0; index < existingImages.length; index++) {
          const { error: positionError } = await supabase
            .from('listing_images')
            .update({ position: index + 1 })
            .eq('id', existingImages[index].id);

          if (positionError) throw positionError;
        }
      }

      const imageInserts = [];
      for (let i = 0; i < newImages.length; i++) {
        const position = existingImages.length + i + 1;
        setUploadProgress(Math.round((i / Math.max(newImages.length, 1)) * 100));
        const { url, storage_path } = await uploadListingImage(
          supabase,
          newImages[i].file,
          listingId,
          position
        );
        imageInserts.push({
          listing_id: listingId,
          url,
          storage_path,
          position,
        });
      }

      if (imageInserts.length > 0) {
        const { error: imgError } = await supabase.from('listing_images').insert(imageInserts);

        if (imgError) throw imgError;
      }

      setUploadProgress(100);

      router.push(`/listing/${listingId}`);
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
      <ImageUploader items={images} onChange={setImages} error={imageError} />

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
          isEditing ? 'Save changes' : 'Post listing'
        )}
      </button>
    </form>
  );
}
