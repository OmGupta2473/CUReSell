'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, X } from 'lucide-react';
import type { ListingImage } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

export type ImageUploadItem =
  | {
      kind: 'existing';
      id: string;
      url: string;
      storage_path: string;
      position: number;
    }
  | {
      kind: 'new';
      id: string;
      file: File;
    };

interface ImageUploaderProps {
  items: ImageUploadItem[];
  onChange: (items: ImageUploadItem[]) => void;
  maxFiles?: number;
  error?: string;
}

const MAX_IMAGE_SIZE_MB = 8;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

function createExistingItem(image: ListingImage): ImageUploadItem {
  return {
    kind: 'existing',
    id: image.id,
    url: image.url,
    storage_path: image.storage_path,
    position: image.position,
  };
}

export function mapListingImagesToUploadItems(images: ListingImage[] = []): ImageUploadItem[] {
  return images.map(createExistingItem);
}

export function ImageUploader({ items, onChange, maxFiles = 4, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setPreviews((currentPreviews) => {
      const nextPreviews: Record<string, string> = {};

      items.forEach((item) => {
        if (item.kind === 'existing') {
          nextPreviews[item.id] = item.url;
          return;
        }

        nextPreviews[item.id] = currentPreviews[item.id] ?? URL.createObjectURL(item.file);
      });

      Object.entries(currentPreviews).forEach(([id, url]) => {
        if (!nextPreviews[id] && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      return nextPreviews;
    });
  }, [items]);

  useEffect(
    () => () => {
      Object.values(previews).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    },
    [previews]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setLocalError('');

    const remainingSlots = maxFiles - items.length;
    if (remainingSlots <= 0) {
      setLocalError(`You can add up to ${maxFiles} photos.`);
      e.target.value = '';
      return;
    }

    const valid = selected.filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setLocalError('Use JPG, PNG, WebP, HEIC, or HEIF images.');
        return false;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setLocalError(`Each photo must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`);
        return false;
      }

      return true;
    });

    const newItems = valid.map((file, index) => ({
      kind: 'new' as const,
      id: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      file,
    }));
    const combined = [...items, ...newItems].slice(0, maxFiles);
    onChange(combined);
    e.target.value = '';
  }

  function removeFile(index: number) {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  }

  const slots = Array.from({ length: maxFiles });

  return (
    <section className="glass-panel space-y-3 rounded-[1.6rem] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="text-sm font-black text-white">
            Photos <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            First photo becomes the cover. Add up to {maxFiles} clear photos.
          </p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-slate-300">
          {items.length}/{maxFiles}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {slots.map((_, i) => {
          const item = items[i];
          const preview = item ? previews[item.id] : undefined;
          const isFirst = i === 0;
          const isAvailable = items.length >= i;

          if (item && preview) {
            return (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-[1.1rem] border border-white/[0.08] bg-white/[0.05]"
              >
                <Image src={preview} alt={`Listing photo ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/70"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <X size={14} />
                </button>
                {isFirst && (
                  <span className="absolute bottom-2 left-2 rounded-full border border-white/[0.14] bg-black/55 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    Cover
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!isAvailable}
              className={cn(
                'aspect-square rounded-[1.1rem] border-2 border-dashed transition-all',
                'flex flex-col items-center justify-center gap-2',
                isFirst && items.length === 0
                  ? 'border-sky-300/20 bg-sky-400/[0.12] text-sky-100 hover:bg-sky-400/[0.18]'
                  : 'border-white/[0.08] bg-white/[0.04] text-slate-500 hover:border-white/[0.16] hover:bg-white/[0.08]',
                !isAvailable && 'cursor-not-allowed opacity-30'
              )}
              aria-label={isFirst && items.length === 0 ? 'Add cover photo' : `Add photo ${i + 1}`}
            >
              {isFirst && items.length === 0 ? <ImagePlus size={24} /> : <Camera size={18} />}
              {isFirst && items.length === 0 && (
                <span className="text-xs font-bold">Add photos</span>
              )}
            </button>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {(error || localError) && (
        <p className="text-xs font-semibold text-red-500" role="alert">
          {error || localError}
        </p>
      )}
    </section>
  );
}
