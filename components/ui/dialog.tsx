import type { HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Dialog({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogContent({ className = '', ...props }: DivProps) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`.trim()} {...props} />;
}

export function DialogHeader({ className = '', ...props }: DivProps) {
  return <div className={`space-y-1 ${className}`.trim()} {...props} />;
}

export function DialogTitle({ className = '', ...props }: DivProps) {
  return <div className={`text-lg font-semibold ${className}`.trim()} {...props} />;
}
