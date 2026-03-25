import type { HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: DivProps) {
  return <div className={`rounded-xl border border-slate-100 bg-white ${className}`.trim()} {...props} />;
}

export function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={`p-4 ${className}`.trim()} {...props} />;
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={`p-4 pt-0 ${className}`.trim()} {...props} />;
}

export function CardFooter({ className = '', ...props }: DivProps) {
  return <div className={`p-4 pt-0 ${className}`.trim()} {...props} />;
}
