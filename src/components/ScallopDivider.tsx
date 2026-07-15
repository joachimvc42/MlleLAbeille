/**
 * A soft scalloped edge — like a rug or a fabric hem curling over the
 * threshold into the next room. `color` is the room being entered; the
 * divider sits at the top of that room's wrapper, overlapping the room
 * above it by its own height.
 */
export function ScallopDivider({
  color,
  className = "",
}: {
  color: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 30"
      preserveAspectRatio="none"
      className={`block h-[26px] w-full ${className}`}
    >
      <path
        d="M0 30 Q 30 0 60 30 T 120 30 T 180 30 T 240 30 T 300 30 T 360 30 T 420 30 T 480 30 T 540 30 T 600 30 T 660 30 T 720 30 T 780 30 T 840 30 T 900 30 T 960 30 T 1020 30 T 1080 30 T 1140 30 T 1200 30 Z"
        fill={color}
      />
    </svg>
  );
}
