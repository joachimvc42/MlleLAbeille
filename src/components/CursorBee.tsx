/**
 * Compact bee icon for the custom cursor, wings split into separate groups
 * so each can flap independently via CSS (see .animate-wing-flap-left/right).
 */
export function CursorBee({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <g className="origin-[20px_13px] animate-wing-flap-right">
        <ellipse cx="21" cy="12" rx="7" ry="4.6" fill="#D9E7EF" opacity="0.92" transform="rotate(18 21 12)" />
      </g>
      <g className="origin-[12px_13px] animate-wing-flap-left">
        <ellipse cx="11" cy="12" rx="7" ry="4.6" fill="#D9E7EF" opacity="0.92" transform="rotate(-18 11 12)" />
      </g>
      <path d="M13 8c-1.3-1.8-3.2-2.7-4.8-2.4" stroke="#B26E68" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M19 8c1.3-1.8 3.2-2.7 4.8-2.4" stroke="#B26E68" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="7.7" cy="5.1" r="1.3" fill="#B26E68" />
      <circle cx="24.3" cy="5.1" r="1.3" fill="#B26E68" />
      <ellipse cx="16" cy="18" rx="9" ry="10.5" fill="#F2D488" />
      <path
        d="M7.2 20a9 10.5 0 0 0 17.6 0c-2.6-1-5.8-1.6-8.8-1.6s-6.2.6-8.8 1.6Z"
        fill="#C99A3C"
        opacity="0.85"
      />
      <path
        d="M8.7 25.4a9 10.5 0 0 0 14.6 0c-2.2-.8-4.8-1.3-7.3-1.3s-5.1.5-7.3 1.3Z"
        fill="#F2D488"
      />
    </svg>
  );
}
