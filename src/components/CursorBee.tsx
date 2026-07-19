/**
 * Compact bee for the custom cursor, seen from behind so she seems to fly
 * ahead of the pointer — same round shape, golden body, brown stripes and
 * pale wings as the boutique's logo bee. Wings are split into separate
 * groups so each can flap independently (.animate-wing-flap-left/right).
 */
export function CursorBee({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <g className="origin-[20px_12px] animate-wing-flap-right">
        <ellipse cx="21.5" cy="11" rx="7" ry="4.8" fill="#DCE8EE" opacity="0.92" transform="rotate(20 21.5 11)" />
      </g>
      <g className="origin-[12px_12px] animate-wing-flap-left">
        <ellipse cx="10.5" cy="11" rx="7" ry="4.8" fill="#DCE8EE" opacity="0.92" transform="rotate(-20 10.5 11)" />
      </g>
      {/* antennae */}
      <path d="M13 6.4C11.8 4.8 10 4 8.6 4.2" stroke="#7d5433" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M19 6.4C20.2 4.8 22 4 23.4 4.2" stroke="#7d5433" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="3.9" r="1.4" fill="#6b4a2e" />
      <circle cx="24" cy="3.9" r="1.4" fill="#6b4a2e" />
      {/* round head from behind */}
      <circle cx="16" cy="9.4" r="4.8" fill="#F5D488" />
      {/* striped abdomen, matching the logo bee's bands */}
      <ellipse cx="16" cy="20" rx="9.5" ry="11" fill="#F5D488" />
      <path
        d="M6.9 22.4a9.5 11 0 0 0 18.2 0c-2.7-1.1-6-1.7-9.1-1.7s-6.4.6-9.1 1.7Z"
        fill="#8a5a36"
        opacity="0.9"
      />
      <path
        d="M8.6 27.6a9.5 11 0 0 0 14.8 0c-2.2-.9-4.8-1.4-7.4-1.4s-5.2.5-7.4 1.4Z"
        fill="#F5D488"
      />
      <path
        d="M7.1 15.6c2.7-1 5.9-1.5 8.9-1.5s6.2.5 8.9 1.5"
        stroke="#8a5a36"
        strokeWidth="2.4"
        fill="none"
        opacity="0.9"
      />
      {/* stinger tip */}
      <path d="M16 31l-1.3-2.3h2.6Z" fill="#6b4a2e" />
    </svg>
  );
}
