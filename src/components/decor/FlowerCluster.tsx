/**
 * A loose spray of wildflowers in the palette of the reference artwork —
 * white daisies, yellow pompoms, a small pink cosmos on leafy stems.
 * Purely decorative; scattered through the site so the flowers accompany
 * the visit from page to page without ever crowding the content.
 */
export function FlowerCluster({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 150"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* stems */}
      <g stroke="#8ba06f" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M46 148 C 44 118, 40 92, 30 64" />
        <path d="M52 148 C 56 116, 62 88, 62 52" />
        <path d="M58 148 C 66 124, 82 100, 92 82" />
        <path d="M50 148 C 48 132, 44 120, 36 108" />
      </g>
      {/* leaves */}
      <g fill="#a9b98b">
        <path d="M42 116c-9-2-14-8-15-15 8 1 13 6 15 15Z" />
        <path d="M60 100c9-3 13-9 13-16-8 2-12 8-13 16Z" />
        <path d="M72 118c8-1 13-5 15-11-7 0-12 4-15 11Z" />
        <path d="M46 132c-7-1-11-4-13-9 6 0 10 3 13 9Z" fill="#93a571" />
      </g>
      {/* white daisy */}
      <g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse
            key={a}
            cx="62"
            cy="38"
            rx="5.2"
            ry="12"
            fill="#fdfaf1"
            stroke="#efe3cd"
            strokeWidth="0.8"
            transform={`rotate(${a} 62 44)`}
          />
        ))}
        <circle cx="62" cy="44" r="6.5" fill="#e6b34c" />
        <circle cx="60" cy="42" r="2" fill="#f2d489" />
      </g>
      {/* yellow pompoms */}
      <g>
        <circle cx="28" cy="58" r="10" fill="#e9bf5e" />
        <circle cx="28" cy="58" r="10" fill="none" stroke="#d9a63c" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="24" cy="55" r="1.6" fill="#c8922e" />
        <circle cx="31" cy="57" r="1.6" fill="#c8922e" />
        <circle cx="27" cy="62" r="1.6" fill="#c8922e" />
        <circle cx="94" cy="76" r="7" fill="#eec86b" />
        <circle cx="92" cy="74" r="1.3" fill="#c8922e" />
        <circle cx="96" cy="78" r="1.3" fill="#c8922e" />
      </g>
      {/* small pink cosmos */}
      <g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="36"
            cy="100"
            rx="3.6"
            ry="7"
            fill="#f2cfc7"
            transform={`rotate(${a} 36 104)`}
          />
        ))}
        <circle cx="36" cy="104" r="3.4" fill="#c98781" />
      </g>
      {/* buds */}
      <circle cx="70" cy="24" r="3" fill="#f0d9a0" />
      <circle cx="14" cy="76" r="2.4" fill="#f0d9a0" />
      <circle cx="104" cy="60" r="2.4" fill="#ecd3b9" />
    </svg>
  );
}
