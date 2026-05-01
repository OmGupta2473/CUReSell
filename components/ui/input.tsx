import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder:text-gray-500 dark:focus:ring-teal-950',
        className
      )}
      {...props}
    />
  );
}
