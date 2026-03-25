import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 ${className}`.trim()}
      {...props}
    />
  );
}
