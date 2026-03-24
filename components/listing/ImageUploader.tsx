'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Camera } from 'lucide-react';
import type { ListingImage } from '@/lib/types';

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

  useEffect(() => () => {
    Object.values(previews).forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }, [previews]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => f.type.startsWith('image/'));
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Photos <span className="text-red-500">*</span>
        <span className="ml-1 font-normal text-gray-400">({items.length}/{maxFiles})</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((_, i) => {
          const item = items[i];
          const preview = item ? previews[item.id] : undefined;
          const isFirst = i === 0;

          if (item && preview) {
            return (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
              >
                <Image src={preview} alt={`Photo ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                >
                  <X size={10} />
                </button>
                {isFirst && (
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                    Cover
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={items.length < i}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors
                ${isFirst && items.length === 0 ? 'border-black bg-gray-50 hover:bg-gray-100' : 'border-gray-200 hover:border-gray-300 bg-white'}
                ${items.length < i ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Camera
                size={isFirst && items.length === 0 ? 20 : 16}
                className="text-gray-400"
              />
              {isFirst && items.length === 0 && (
                <span className="text-[10px] font-medium text-gray-400">Add photo</span>
              )}
            </button>
          );
        })}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">First photo is the cover image. Max 4 photos.</p>
    </div>
  );
}
