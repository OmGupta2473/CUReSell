import type { HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Dialog({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogContent({ className = '', ...props }: DivProps) {
  return (
    <div
      className={`glass-panel rounded-2xl p-5 text-slate-100 shadow-[0_28px_70px_rgba(0,0,0,0.32)] ${className}`.trim()}
      {...props}
    />
  );
}

export function DialogHeader({ className = '', ...props }: DivProps) {
  return <div className={`space-y-1 ${className}`.trim()} {...props} />;
}

export function DialogTitle({ className = '', ...props }: DivProps) {
  return <div className={`text-lg font-semibold tracking-tight text-white ${className}`.trim()} {...props} />;
}
