/**
 * One little bee per celebration, drawn after the boutique's bee: round
 * golden body, brown stripes, rosy cheeks, pale side wings — each holding
 * the attribute of her celebration (bottle, cake, flower, heart…).
 * Falls back to the catalogue emoji for any unknown slug.
 */

function BeeBase({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {/* wings */}
      <ellipse cx="13" cy="17" rx="8" ry="5.6" fill="#DCE8EE" opacity="0.9" transform="rotate(-22 13 17)" />
      <ellipse cx="35" cy="17" rx="8" ry="5.6" fill="#DCE8EE" opacity="0.9" transform="rotate(22 35 17)" />
      {/* antennae */}
      <path d="M20 10c-1.6-2.6-4-4-6.4-3.8" stroke="#7d5433" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M28 10c1.6-2.6 4-4 6.4-3.8" stroke="#7d5433" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="13.2" cy="5.8" r="1.8" fill="#6b4a2e" />
      <circle cx="34.8" cy="5.8" r="1.8" fill="#6b4a2e" />
      {/* body */}
      <ellipse cx="24" cy="26" rx="13" ry="14.5" fill="#F5D488" />
      <path
        d="M11.6 29.4a13 14.5 0 0 0 24.8 0c-3.7-1.4-8.2-2.2-12.4-2.2s-8.7.8-12.4 2.2Z"
        fill="#8a5a36"
        opacity="0.9"
      />
      <path
        d="M13.7 36.6a13 14.5 0 0 0 20.6 0c-3-1.2-6.6-1.8-10.3-1.8s-7.3.6-10.3 1.8Z"
        fill="#F5D488"
      />
      {/* face */}
      <circle cx="19.5" cy="21" r="1.5" fill="#4a3320" />
      <circle cx="28.5" cy="21" r="1.5" fill="#4a3320" />
      <path d="M21.8 24.6c.7.8 1.5 1.1 2.2 1.1s1.5-.3 2.2-1.1" stroke="#4a3320" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="15.8" cy="24" r="2" fill="#EFB7AF" opacity="0.85" />
      <circle cx="32.2" cy="24" r="2" fill="#EFB7AF" opacity="0.85" />
      {children}
    </>
  );
}

const bees: Record<string, React.ReactNode> = {
  naissance: (
    <BeeBase>
      {/* baby bottle */}
      <g transform="rotate(14 38 32)">
        <rect x="35" y="27" width="7" height="12" rx="2.6" fill="#EAF2F7" stroke="#B9CAD6" strokeWidth="0.8" />
        <rect x="36.2" y="24.6" width="4.6" height="3" rx="1.2" fill="#E3B351" />
        <path d="M38.5 22.4c1 0 1.8.9 1.8 2.2h-3.6c0-1.3.8-2.2 1.8-2.2Z" fill="#EFB7AF" />
        <path d="M35.6 33h5.8" stroke="#B9CAD6" strokeWidth="0.7" />
      </g>
    </BeeBase>
  ),
  anniversaire: (
    <BeeBase>
      {/* little cake with one candle */}
      <g>
        <rect x="32.5" y="31" width="12" height="7" rx="2" fill="#F7E9E6" stroke="#E0BFB8" strokeWidth="0.8" />
        <path d="M32.5 34c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 2 1.1 3 .4" stroke="#EFB7AF" strokeWidth="1.2" fill="none" />
        <rect x="37.6" y="26.5" width="1.8" height="4.5" rx="0.9" fill="#E3B351" />
        <ellipse cx="38.5" cy="25.3" rx="1.1" ry="1.6" fill="#E8A03C" />
      </g>
    </BeeBase>
  ),
  amitie: (
    <BeeBase>
      {/* a tiny friend bee flying in */}
      <g transform="translate(34 28) scale(0.42)">
        <ellipse cx="10" cy="14" rx="8" ry="6" fill="#DCE8EE" opacity="0.9" transform="rotate(-20 10 14)" />
        <ellipse cx="22" cy="14" rx="8" ry="6" fill="#DCE8EE" opacity="0.9" transform="rotate(20 22 14)" />
        <ellipse cx="16" cy="20" rx="10" ry="11" fill="#F5D488" />
        <path d="M6.5 22.5a10 11 0 0 0 19 0c-2.8-1.1-6.2-1.7-9.5-1.7s-6.7.6-9.5 1.7Z" fill="#8a5a36" opacity="0.9" />
        <circle cx="12.5" cy="17" r="1.4" fill="#4a3320" />
        <circle cx="19.5" cy="17" r="1.4" fill="#4a3320" />
        <path d="M14.2 20.2c.6.7 1.2.9 1.8.9s1.2-.2 1.8-.9" stroke="#4a3320" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </g>
    </BeeBase>
  ),
  remerciement: (
    <BeeBase>
      {/* daisy held out */}
      <g transform="rotate(10 39 31)">
        <path d="M39 39v-7" stroke="#8ba06f" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M39 36c2-.4 3.4-1.4 4-3" stroke="#8ba06f" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="39" cy="28.6" rx="1.7" ry="3.4" fill="#FDFAF1" stroke="#EFE3CD" strokeWidth="0.5" transform={`rotate(${a} 39 30.4)`} />
        ))}
        <circle cx="39" cy="30.4" r="2" fill="#E6B34C" />
      </g>
    </BeeBase>
  ),
  amour: (
    <BeeBase>
      {/* a plump heart hugged close */}
      <path
        d="M37 28.6c-1.8-2-4.8-1.5-5.6.6-.6 1.6.2 3.3 1.9 4.7 1.3 1.1 2.8 1.9 3.7 2.3.9-.4 2.4-1.2 3.7-2.3 1.7-1.4 2.5-3.1 1.9-4.7-.8-2.1-3.8-2.6-5.6-.6Z"
        fill="#EFB7AF"
        stroke="#DB9C92"
        strokeWidth="0.8"
      />
      <circle cx="34.6" cy="30" r="0.9" fill="#FBE3DE" opacity="0.9" />
    </BeeBase>
  ),
  "yoga-bien-etre": (
    <BeeBase>
      {/* lotus arms + closed happy eyes drawn over the base face */}
      <rect x="17" y="19.4" width="5" height="3.4" rx="1.7" fill="#F5D488" />
      <rect x="26" y="19.4" width="5" height="3.4" rx="1.7" fill="#F5D488" />
      <path d="M18 21.2c.9-1 2.1-1 3 0" stroke="#4a3320" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M27 21.2c.9-1 2.1-1 3 0" stroke="#4a3320" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M12.5 30c-2.4 1.4-3.4 3.2-2.8 4.6.5 1.1 2 1.3 3.4.6" stroke="#E8C06A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M35.5 30c2.4 1.4 3.4 3.2 2.8 4.6-.5 1.1-2 1.3-3.4.6" stroke="#E8C06A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </BeeBase>
  ),
  "petites-attentions": (
    <BeeBase>
      {/* little gift box with ribbon */}
      <g transform="rotate(-8 38 33)">
        <rect x="33.5" y="30" width="9.5" height="8" rx="1.6" fill="#EFB7AF" stroke="#DB9C92" strokeWidth="0.8" />
        <path d="M38.25 30v8M33.5 33.6h9.5" stroke="#C98781" strokeWidth="1.1" />
        <path d="M38.25 30c-1.4-1.8-3.4-2.2-4-1s.8 2 4 1Zm0 0c1.4-1.8 3.4-2.2 4-1s-.8 2-4 1Z" fill="#C98781" />
      </g>
    </BeeBase>
  ),
};

export function CelebrationBee({
  slug,
  fallback,
  className,
}: {
  slug: string;
  fallback?: string;
  className?: string;
}) {
  const bee = bees[slug];
  if (!bee) return <span aria-hidden="true">{fallback ?? "🐝"}</span>;
  return (
    <svg viewBox="0 0 48 44" aria-hidden="true" className={className}>
      {bee}
    </svg>
  );
}
