'use client';

import { useState } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { listingSchema, type ListingFormValues } from '@/lib/validations/listing';
import { uploadListingImage } from '@/lib/utils/imageCompression';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUploader, mapListingImagesToUploadItems, type ImageUploadItem } from './ImageUploader';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  type Category,
  type Condition,
  type Listing,
} from '@/lib/types';
import { cn } from '@/lib/utils/cn';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
      <ImageUploader items={images} onChange={setImages} error={imageError} />

      <section className="space-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h2 className="text-base font-black text-gray-950 dark:text-white">Listing details</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Clear titles and honest details help students decide faster.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Title <span className="text-red-500">*</span>
          </label>
          <Input {...register('title')} placeholder="e.g. Study table with chair" />
          {errors.title && <p className="text-xs font-semibold text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('category', value, { shouldValidate: true })}
                aria-pressed={selectedCategory === value}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-center text-xs font-bold transition-colors',
                  selectedCategory === value
                    ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs font-semibold text-red-500">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Condition <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {CONDITIONS.map(([value, label, desc]) => {
              const active = selectedCondition === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('condition', value, { shouldValidate: true })}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800'
                  )}
                >
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className={cn('mt-0.5 block text-xs', active ? 'text-white/70 dark:text-gray-600' : 'text-gray-500')}>
                      {desc}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      active ? 'border-white bg-white text-gray-950 dark:border-gray-950 dark:bg-gray-950 dark:text-white' : 'border-gray-300'
                    )}
                  >
                    {active && <Check size={12} />}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.condition && <p className="text-xs font-semibold text-red-500">{errors.condition.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
              Rs.
            </span>
            <Input
              {...register('priceInput')}
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="pl-11"
            />
          </div>
          {errors.priceInput && (
            <p className="text-xs font-semibold text-red-500">{errors.priceInput.message}</p>
          )}

          <button
            type="button"
            onClick={() => setValue('is_negotiable', !isNegotiable)}
            className="mt-3 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-left transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800"
            aria-pressed={isNegotiable}
          >
            <span>
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">
                Open to offers
              </span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                Let buyers know the price is flexible.
              </span>
            </span>
            <span
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                isNegotiable ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  isNegotiable ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </span>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Description
            <span className="ml-1 font-medium text-gray-400">(optional)</span>
          </label>
          <textarea
            {...register('description')}
            placeholder="Describe the item: age, defects, pickup notes, or reason for selling."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:focus:ring-teal-950"
          />
          {errors.description && (
            <p className="text-xs font-semibold text-red-500">{errors.description.message}</p>
          )}
        </div>
      </section>

      {submitError && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      {submitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>Uploading photos</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="sticky bottom-20 z-20 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 md:bottom-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Info size={14} />
            You can edit details later from the listing page.
          </p>
          <Button type="submit" disabled={submitting} variant="primary" size="lg" className="w-full sm:w-auto">
            {submitting
              ? uploadProgress < 100
                ? `Uploading ${uploadProgress}%`
                : 'Saving...'
              : isEditing
                ? 'Save changes'
                : 'Post listing'}
          </Button>
        </div>
      </div>
    </form>
  );
}
