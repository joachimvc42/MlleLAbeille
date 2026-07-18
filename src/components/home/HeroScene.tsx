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

      {/* Fine white steam over the tea, undulating along its whole length. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 230"
        className="steam-svg pointer-events-none absolute left-[11%] top-[22%] h-[44%] w-[13%]"
      >
        <defs>
          <filter id="steam-soften" x="-60%" y="-20%" width="220%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <linearGradient id="steam-white" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fffdf7" stopOpacity="0.85" />
            <stop offset="0.7" stopColor="#fffef9" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g
          filter="url(#steam-soften)"
          stroke="url(#steam-white)"
          strokeLinecap="round"
          fill="none"
        >
          <path strokeWidth="3.4" d="M46 226 C 36 202, 58 184, 46 156 C 36 132, 58 114, 46 88 C 38 68, 56 52, 46 28 C 42 18, 48 10, 45 2">
            <animate
              attributeName="d"
              dur="4.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
              values="M46 226 C 36 202, 58 184, 46 156 C 36 132, 58 114, 46 88 C 38 68, 56 52, 46 28 C 42 18, 48 10, 45 2;M46 226 C 56 202, 34 184, 46 156 C 56 132, 34 114, 46 88 C 54 68, 36 52, 46 28 C 50 18, 42 10, 47 2;M46 226 C 36 202, 58 184, 46 156 C 36 132, 58 114, 46 88 C 38 68, 56 52, 46 28 C 42 18, 48 10, 45 2"
            />
            <animate
              attributeName="opacity"
              dur="4.6s"
              repeatCount="indefinite"
              values="0.9;0.65;0.9"
            />
          </path>
          <path strokeWidth="2.4" opacity="0.75" d="M60 218 C 68 196, 50 178, 60 152 C 69 128, 51 110, 60 86 C 66 68, 54 54, 60 34">
            <animate
              attributeName="d"
              dur="5.6s"
              begin="-2.1s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
              values="M60 218 C 68 196, 50 178, 60 152 C 69 128, 51 110, 60 86 C 66 68, 54 54, 60 34;M60 218 C 52 196, 68 178, 60 152 C 51 128, 69 110, 60 86 C 54 68, 66 54, 60 34;M60 218 C 68 196, 50 178, 60 152 C 69 128, 51 110, 60 86 C 66 68, 54 54, 60 34"
            />
          </path>
          <path strokeWidth="2" opacity="0.6" d="M34 214 C 28 194, 42 178, 34 154 C 27 132, 41 116, 34 96 C 30 84, 38 72, 34 58">
            <animate
              attributeName="d"
              dur="6.4s"
              begin="-3.4s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
              values="M34 214 C 28 194, 42 178, 34 154 C 27 132, 41 116, 34 96 C 30 84, 38 72, 34 58;M34 214 C 40 194, 26 178, 34 154 C 41 132, 27 116, 34 96 C 38 84, 30 72, 34 58;M34 214 C 28 194, 42 178, 34 154 C 27 132, 41 116, 34 96 C 30 84, 38 72, 34 58"
            />
          </path>
        </g>
      </svg>
    </div>
  );
}
