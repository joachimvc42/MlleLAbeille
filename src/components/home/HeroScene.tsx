import Image from "next/image";

/*
 * The hero still life is the real painted artwork — the bee reading on her
 * quilted cushion over the knitted throw, tea cooling on its wooden coaster,
 * the jar of « Miel de tendresse », a ceramic pitcher of wildflowers.
 * Nothing here is rebuilt in vectors, so every material keeps its watercolour
 * grain. The scene is intentionally still; the only living detail is the
 * steam waving above the tea.
 */
export function HeroScene({ beeAlt }: { beeAlt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[1000px] select-none">
      <Image
        src="/brand/hero-still-life.webp"
        alt={beeAlt}
        width={988}
        height={596}
        priority
        sizes="(max-width: 1024px) 100vw, 62vw"
        className="h-auto w-full"
      />

      {/* Steam rising from the tea cup, waving like warm air. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 220"
        className="pointer-events-none absolute left-[10.5%] top-[24%] h-[42%] w-[14%]"
      >
        <defs>
          <filter id="steam-soften" x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          <linearGradient id="steam-fade" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#bda88c" stopOpacity="0.55" />
            <stop offset="0.65" stopColor="#c9b79d" stopOpacity="0.34" />
            <stop offset="1" stopColor="#d6c7ae" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g
          filter="url(#steam-soften)"
          stroke="url(#steam-fade)"
          strokeLinecap="round"
          fill="none"
        >
          <path
            className="steam-path"
            strokeWidth="7"
            d="M42 212 C 30 186, 56 168, 44 140 C 33 115, 57 96, 46 68 C 38 47, 52 32, 47 14"
          />
          <path
            className="steam-path"
            strokeWidth="5.5"
            d="M62 208 C 74 184, 50 162, 63 136 C 74 113, 52 94, 64 68 C 72 50, 60 34, 66 20"
          />
          <path
            className="steam-path"
            strokeWidth="4.5"
            d="M52 214 C 46 194, 60 178, 53 154 C 46 132, 60 116, 54 94"
          />
        </g>
      </svg>
    </div>
  );
}
