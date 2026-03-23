import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Tabs({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}

export function TabsList({ className = '', ...props }: DivProps) {
  return <div className={`inline-flex gap-2 rounded-lg bg-slate-100 p-1 ${className}`.trim()} {...props} />;
}

export function TabsTrigger({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-md px-3 py-2 text-sm ${className}`.trim()} {...props} />;
}

export function TabsContent({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}
