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

      <section className="glass-panel space-y-5 rounded-[1.6rem] p-4 sm:p-5">
        <div>
          <h2 className="text-base font-black text-white">Listing details</h2>
          <p className="mt-1 text-sm text-slate-400">
            Clear titles and honest details help students decide faster.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-100">
            Title <span className="text-red-500">*</span>
          </label>
          <Input {...register('title')} placeholder="e.g. Study table with chair" />
          {errors.title && <p className="text-xs font-semibold text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-100">
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
                  'rounded-xl border px-3 py-2.5 text-center text-xs font-bold transition-all',
                  selectedCategory === value
                    ? 'border-sky-300/20 bg-sky-400/[0.16] text-sky-100 shadow-[0_14px_28px_rgba(88,161,255,0.18)]'
                    : 'border-white/[0.08] bg-white/[0.05] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs font-semibold text-red-500">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-100">
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
                    'flex w-full items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left transition-all',
                    active
                      ? 'border-sky-300/20 bg-sky-400/[0.16] text-white shadow-[0_16px_36px_rgba(88,161,255,0.18)]'
                      : 'border-white/[0.08] bg-white/[0.04] text-slate-200 hover:border-white/[0.14] hover:bg-white/[0.07]'
                  )}
                >
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className={cn('mt-0.5 block text-xs', active ? 'text-white/70' : 'text-slate-400')}>
                      {desc}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      active ? 'border-white bg-white text-slate-950' : 'border-white/[0.18]'
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
          <label className="text-sm font-bold text-slate-100">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
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
            className="mt-3 flex w-full items-center justify-between rounded-[1.1rem] border border-white/[0.08] bg-white/[0.05] px-3 py-3 text-left transition-all hover:border-white/[0.14] hover:bg-white/[0.08]"
            aria-pressed={isNegotiable}
          >
            <span>
              <span className="block text-sm font-bold text-slate-100">
                Open to offers
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                Let buyers know the price is flexible.
              </span>
            </span>
            <span
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                isNegotiable ? 'bg-sky-400/90' : 'bg-white/[0.16]'
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
          <label className="text-sm font-bold text-slate-100">
            Description
            <span className="ml-1 font-medium text-slate-500">(optional)</span>
          </label>
          <textarea
            {...register('description')}
            placeholder="Describe the item: age, defects, pickup notes, or reason for selling."
            rows={4}
            className="w-full resize-none rounded-[1.1rem] border border-white/[0.1] bg-white/[0.06] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
          />
          {errors.description && (
            <p className="text-xs font-semibold text-red-500">{errors.description.message}</p>
          )}
        </div>
      </section>

      {submitError && (
        <div className="flex gap-2 rounded-[1.2rem] border border-red-400/20 bg-red-400/[0.12] p-3 text-sm font-semibold text-red-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      {submitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="glass-panel-muted space-y-2 rounded-[1.2rem] p-4">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Uploading photos</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="glass-panel sticky bottom-20 z-20 rounded-[1.4rem] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.3)] md:bottom-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
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
