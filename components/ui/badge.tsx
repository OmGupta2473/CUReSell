import type { HTMLAttributes } from 'react';

export function Badge({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.08] px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-xl ${className}`.trim()}
      {...props}
    />
  );
}
