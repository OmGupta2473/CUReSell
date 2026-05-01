/* eslint-disable @next/next/no-img-element */
import type { HTMLAttributes, ImgHTMLAttributes } from 'react';

export function Avatar({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`glass-panel-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ${className}`.trim()}
      {...props}
    />
  );
}

export function AvatarImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={props.alt ?? ''} {...props} />;
}

export function AvatarFallback({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`text-sm font-medium text-slate-200 ${className}`.trim()} {...props} />;
}
