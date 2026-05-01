interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function VerifiedBadge({ size = 'sm', showLabel = false }: VerifiedBadgeProps) {
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      title="CU Verified Student"
      className={`inline-flex items-center gap-1 rounded-full border border-sky-300/20 bg-sky-400/[0.12] font-medium text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        ${size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {showLabel && 'CU Verified'}
    </span>
  );
}
