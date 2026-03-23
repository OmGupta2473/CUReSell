'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Camera } from 'lucide-react';

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

export function ImageUploader({ files, onChange, maxFiles = 4, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => f.type.startsWith('image/'));
    const combined = [...files, ...valid].slice(0, maxFiles);
    onChange(combined);

    const newPreviews: string[] = [];
    combined.forEach((file, i) => {
      if (previews[i]) {
        newPreviews[i] = previews[i];
      } else {
        const url = URL.createObjectURL(file);
        newPreviews[i] = url;
      }
    });
    setPreviews(newPreviews);
    e.target.value = '';
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    onChange(updated);
    setPreviews(updatedPreviews);
  }

  const slots = Array.from({ length: maxFiles });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Photos <span className="text-red-500">*</span>
        <span className="ml-1 font-normal text-gray-400">({files.length}/{maxFiles})</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((_, i) => {
          const file = files[i];
          const preview = previews[i];
          const isFirst = i === 0;

          if (file && preview) {
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
              disabled={files.length < i}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors
                ${isFirst && files.length === 0 ? 'border-black bg-gray-50 hover:bg-gray-100' : 'border-gray-200 hover:border-gray-300 bg-white'}
                ${files.length < i ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Camera
                size={isFirst && files.length === 0 ? 20 : 16}
                className="text-gray-400"
              />
              {isFirst && files.length === 0 && (
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
