interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function VerifiedBadge({ size = 'sm', showLabel = false }: VerifiedBadgeProps) {
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      title="CU Verified Student"
      className={`inline-flex items-center gap-1 bg-teal-50 text-teal-700 font-medium rounded-full
        ${size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
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
