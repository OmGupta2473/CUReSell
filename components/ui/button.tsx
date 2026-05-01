import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] text-slate-950 shadow-[0_18px_40px_rgba(88,161,255,0.3)] hover:brightness-110',
  secondary:
    'border-white/[0.1] bg-white/[0.06] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.18] hover:bg-white/[0.1]',
  ghost:
    'border-transparent bg-transparent text-slate-300 hover:bg-white/[0.08] hover:text-white',
  danger:
    'border-red-400/20 bg-red-400/12 text-red-100 hover:border-red-400/30 hover:bg-red-400/18',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 py-2 text-xs',
  md: 'h-11 px-[1.125rem] text-sm',
  lg: 'h-12 px-5 text-sm',
  icon: 'h-11 w-11 p-0',
};

export function Button({
  className,
  type = 'button',
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border font-semibold tracking-[-0.01em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--focus))] disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
