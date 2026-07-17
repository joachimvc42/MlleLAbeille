/**
 * A small hand-drawn flowering branch, used to flank editorial links and
 * to garnish the bookmark navigation — always decorative, never essential.
 */
export function FloralSprig({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 28"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M2 24 C 18 20, 40 16, 62 6"
        stroke="#A9B69E"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M20 21c-1-4-4-6-7-6 1 4 3 6 7 6Z" fill="#B9C7AC" />
      <path d="M36 16c-1-4-4-6-7-6 1 4 3 6 7 6Z" fill="#B9C7AC" />
      <circle cx="48" cy="10" r="3.4" fill="#F2DFAE" />
      <circle cx="48" cy="10" r="1.4" fill="#E3B351" />
      <circle cx="59" cy="5" r="2.6" fill="#ECCFCB" />
      <circle cx="59" cy="5" r="1.1" fill="#C98781" />
    </svg>
  );
}
