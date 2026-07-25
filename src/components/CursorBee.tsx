/**
 * Compact bee for the custom cursor, seen from behind so she seems to fly
 * ahead of the pointer — same round shape, golden body, brown stripes and
 * pale wings as the boutique's logo bee. Wings are split into separate
 * groups so each can flap independently (.animate-wing-flap-left/right).
 */
export function CursorBee({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="cursor-bee-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE5A0" />
          <stop offset="0.55" stopColor="#F4C85F" />
          <stop offset="1" stopColor="#DEA33E" />
        </linearGradient>
        <linearGradient id="cursor-bee-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFDF2" stopOpacity="0.96" />
          <stop offset="1" stopColor="#DCE8E7" stopOpacity="0.78" />
        </linearGradient>
        <clipPath id="cursor-bee-body">
          <ellipse cx="16" cy="21" rx="7.4" ry="9.7" />
        </clipPath>
      </defs>

      {/* Small translucent wings, tucked behind the body like the logo. */}
      <g className="origin-[22px_15px] animate-wing-flap-right">
        <ellipse
          cx="22.4"
          cy="15.7"
          rx="5.8"
          ry="3.5"
          fill="url(#cursor-bee-wing)"
          stroke="#C9D9D8"
          strokeWidth="0.45"
          transform="rotate(28 22.4 15.7)"
        />
      </g>
      <g className="origin-[10px_15px] animate-wing-flap-left">
        <ellipse
          cx="9.6"
          cy="15.7"
          rx="5.8"
          ry="3.5"
          fill="url(#cursor-bee-wing)"
          stroke="#C9D9D8"
          strokeWidth="0.45"
          transform="rotate(-28 9.6 15.7)"
        />
      </g>

      {/* Short curved antennae, matching the compact logo proportions. */}
      <path d="M12.2 5.1C11.3 3.7 10.2 3.1 9.2 3.2" stroke="#765033" strokeWidth="1.25" strokeLinecap="round" fill="none" />
      <path d="M19.8 5.1C20.7 3.7 21.8 3.1 22.8 3.2" stroke="#765033" strokeWidth="1.25" strokeLinecap="round" fill="none" />
      <circle cx="8.8" cy="3.1" r="1.15" fill="#67442C" />
      <circle cx="23.2" cy="3.1" r="1.15" fill="#67442C" />

      {/* Narrow rounded abdomen, seen from behind. */}
      <ellipse cx="16" cy="21" rx="7.4" ry="9.7" fill="url(#cursor-bee-gold)" />
      <g clipPath="url(#cursor-bee-body)" fill="#7B4C2E">
        <path d="M7.8 16.1C12 14.8 20 14.8 24.2 16.1V19.3C20 18 12 18 7.8 19.3Z" />
        <path d="M8.2 23C12 21.7 20 21.7 23.8 23V26.4C20 25.1 12 25.1 8.2 26.4Z" />
      </g>
      <ellipse cx="13.8" cy="18.3" rx="1.2" ry="3.8" fill="#FFF0B8" opacity="0.32" transform="rotate(10 13.8 18.3)" />
      <path d="M16 31.2l-1.15-2.05h2.3Z" fill="#67442C" />

      {/* Large rounded head, the defining silhouette of the logo. */}
      <circle cx="16" cy="9.7" r="7.05" fill="url(#cursor-bee-gold)" />
      <ellipse cx="13.6" cy="7.2" rx="2.2" ry="1.45" fill="#FFF2BD" opacity="0.42" transform="rotate(-24 13.6 7.2)" />
    </svg>
  );
}
