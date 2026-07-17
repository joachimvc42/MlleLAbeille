/**
 * A tiny bee tracing a dotted flight path — a discreet wink in a corner
 * of the hero, never a swarm.
 */
export function BeeTrail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 60" aria-hidden="true" className={className}>
      <path
        d="M4 46 C 34 54, 60 20, 88 24 S 128 40, 134 18"
        stroke="#B26E68"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="1 7"
        fill="none"
        opacity="0.55"
      />
      <g className="animate-float" style={{ animationDuration: "3.4s" }}>
        <ellipse cx="139" cy="12" rx="6" ry="4.6" fill="#F2D488" />
        <path d="M134.5 12.6a6 4.6 0 0 0 9 0c-1.4-.7-2.9-1-4.5-1s-3.1.3-4.5 1Z" fill="#8a6a3c" opacity="0.8" />
        <ellipse cx="135.5" cy="7.5" rx="3.4" ry="2.2" fill="#D9E7EF" opacity="0.9" transform="rotate(-28 135.5 7.5)" />
        <ellipse cx="141.5" cy="6.8" rx="3.4" ry="2.2" fill="#D9E7EF" opacity="0.9" transform="rotate(16 141.5 6.8)" />
      </g>
    </svg>
  );
}
