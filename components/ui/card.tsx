import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}
