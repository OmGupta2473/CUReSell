import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Tabs({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}

export function TabsList({ className = '', ...props }: DivProps) {
  return <div className={`inline-flex gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-1.5 backdrop-blur-xl ${className}`.trim()} {...props} />;
}

export function TabsTrigger({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-xl px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white ${className}`.trim()} {...props} />;
}

export function TabsContent({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}
