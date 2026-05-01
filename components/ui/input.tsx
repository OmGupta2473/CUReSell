import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3.5 py-2 text-sm text-slate-50 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl placeholder:text-slate-500 focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10 disabled:cursor-not-allowed disabled:opacity-55',
        className
      )}
      {...props}
    />
  );
}
