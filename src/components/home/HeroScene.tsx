import Image from "next/image";

/*
 * The illustrated still life beside the welcome text, matched to the
 * reference artwork: Mademoiselle l'Abeille settled on a quilted cushion
 * over a knitted throw, with her tea on a wooden coaster, a cloth-topped
 * jar of "Miel de tendresse" with its honey dipper, and a ceramic pitcher
 * of wildflowers. Everything but the real artwork is lightweight SVG/CSS.
 */

/** One row of chunky knit stitches; stacked rows make the throw. */
function KnitThrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 560 150"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-1/2 h-[150px] w-[104%] -translate-x-1/2 drop-shadow-[0_16px_28px_rgba(123,91,67,0.18)]"
    >
      <defs>
        <pattern id="knit" width="34" height="26" patternUnits="userSpaceOnUse">
          <rect width="34" height="26" fill="#F2E4C9" />
          <ellipse cx="9" cy="13" rx="8" ry="11" fill="#F7ECD6" transform="rotate(24 9 13)" />
          <ellipse cx="25" cy="13" rx="8" ry="11" fill="#EFDFC0" transform="rotate(-24 25 13)" />
          <ellipse cx="9" cy="13" rx="4.5" ry="8" fill="none" stroke="#E2CFA8" strokeWidth="1.2" transform="rotate(24 9 13)" />
          <ellipse cx="25" cy="13" rx="4.5" ry="8" fill="none" stroke="#E2CFA8" strokeWidth="1.2" transform="rotate(-24 25 13)" />
        </pattern>
      </defs>
      <path
        d="M18 30 Q 280 -14 542 30 L 556 118 Q 280 156 4 118 Z"
        fill="url(#knit)"
        stroke="#E4D1AC"
        strokeWidth="2"
      />
      {/* rolled hem at the front */}
      <path
        d="M4 118 Q 280 156 556 118 L 552 130 Q 280 168 8 130 Z"
        fill="#EBDABA"
      />
    </svg>
  );
}

/** Ceramic pitcher holding a loose bunch of wildflowers. */
function FlowerPitcher() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 190 300"
      className="absolute -right-2 bottom-[52px] hidden h-[290px] w-[185px] sm:block"
    >
      {/* stems */}
      <g stroke="#A9B69E" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M92 170 C 88 120, 78 80, 58 44" />
        <path d="M98 170 C 100 110, 106 70, 104 30" />
        <path d="M104 170 C 116 120, 132 82, 148 58" />
        <path d="M90 170 C 76 130, 56 100, 34 86" />
        <path d="M108 170 C 124 136, 152 112, 168 104" />
      </g>
      {/* leaves */}
      <g fill="#B9C7AC">
        <path d="M70 120c-8-10-18-14-27-13 4 10 13 15 27 13Z" />
        <path d="M120 118c8-10 18-14 27-13-4 10-13 15-27 13Z" />
        <path d="M96 96c-2-12-8-20-16-24-1 11 5 20 16 24Z" />
      </g>
      {/* daisy */}
      <g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse
            key={a}
            cx="58"
            cy="30"
            rx="5"
            ry="12"
            fill="#FFFDF4"
            transform={`rotate(${a} 58 32)`}
          />
        ))}
        <circle cx="58" cy="32" r="6.5" fill="#E3B351" />
      </g>
      {/* mimosa cluster */}
      <g fill="#EFC65E">
        <circle cx="104" cy="26" r="5.5" />
        <circle cx="114" cy="20" r="4.5" />
        <circle cx="96" cy="18" r="4" />
        <circle cx="108" cy="12" r="3.6" />
        <circle cx="98" cy="30" r="3.4" />
      </g>
      {/* pink cosmos */}
      <g>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="150"
            cy="52"
            rx="5.5"
            ry="10"
            fill="#F0D3CE"
            transform={`rotate(${a} 150 56)`}
          />
        ))}
        <circle cx="150" cy="56" r="5" fill="#C98781" />
      </g>
      {/* small buds */}
      <circle cx="34" cy="84" r="5" fill="#F2DFAE" />
      <circle cx="168" cy="102" r="5" fill="#ECCFCB" />

      {/* pitcher body */}
      <path
        d="M62 172
           C 60 168, 130 168, 128 172
           L 136 200 C 142 250, 128 284, 95 284
           C 62 284, 48 250, 54 200 Z"
        fill="#FDF8EC"
        stroke="#E2D3B8"
        strokeWidth="2"
      />
      {/* spout + handle */}
      <path d="M62 172 l -10 -10 14 4 Z" fill="#FDF8EC" stroke="#E2D3B8" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M132 190 C 158 192, 160 232, 132 240"
        fill="none"
        stroke="#EDE0C6"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* glaze shading */}
      <path
        d="M112 176 C 124 214, 120 258, 98 280 C 120 274, 134 244, 130 202 Z"
        fill="#EFE2C8"
        opacity="0.7"
      />
      <ellipse cx="80" cy="210" rx="10" ry="26" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

/** Cloth-topped honey jar with its label and a leaning dipper. */
function HoneyJar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 160"
      className="absolute bottom-[38px] right-[6%] h-[150px] w-[140px] sm:right-[24%]"
    >
      {/* dipper leaning on the jar */}
      <g transform="rotate(24 118 70)">
        <rect x="114" y="18" width="7" height="78" rx="3.5" fill="#D8B071" />
        <g fill="#C99A3C">
          <rect x="106" y="84" width="23" height="7" rx="3.5" />
          <rect x="104" y="94" width="27" height="8" rx="4" />
          <rect x="106" y="104" width="23" height="7" rx="3.5" />
        </g>
      </g>
      {/* honey drip under the dipper */}
      <ellipse cx="134" cy="148" rx="12" ry="4" fill="#E9B84E" opacity="0.85" />

      {/* jar body */}
      <path
        d="M28 52 C 24 56, 22 66, 22 78 L 22 128 C 22 144, 34 152, 62 152 C 90 152, 102 144, 102 128 L 102 78 C 102 66, 100 56, 96 52 Z"
        fill="#EFB944"
        stroke="#D9A238"
        strokeWidth="2"
      />
      {/* honey glow */}
      <ellipse cx="46" cy="100" rx="12" ry="30" fill="#F8D57C" opacity="0.8" />
      {/* cloth cover: scalloped edge + tie */}
      <path
        d="M22 52 Q 26 34 40 30 Q 62 22 84 30 Q 98 34 102 52
           L 96 56 L 88 50 L 80 57 L 72 50 L 64 57 L 56 50 L 48 57 L 40 50 L 32 56 Z"
        fill="#F8F1DF"
        stroke="#E3D4B4"
        strokeWidth="1.6"
      />
      <path d="M24 52 Q 62 62 100 52" stroke="#C99A3C" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="99" cy="53" r="3.2" fill="#C99A3C" />
      {/* label */}
      <rect x="34" y="76" width="56" height="40" rx="7" fill="#FDF8EC" stroke="#E2D3B8" strokeWidth="1.4" />
      <text
        x="62"
        y="93"
        textAnchor="middle"
        fontFamily="var(--font-lora), Georgia, serif"
        fontSize="12.5"
        fontWeight="600"
        fill="#9d5f59"
      >
        Miel
      </text>
      <text
        x="62"
        y="107"
        textAnchor="middle"
        fontFamily="var(--font-lora), Georgia, serif"
        fontSize="8.5"
        fontStyle="italic"
        fill="#b26e68"
      >
        de tendresse
      </text>
      <path d="M52 111 h20" stroke="#ECCFCB" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Tea cup on a slice-of-wood coaster. */
function TeaCup() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 120"
      className="absolute bottom-[30px] left-[2%] h-[120px] w-[145px] sm:left-[6%]"
    >
      {/* wooden coaster */}
      <ellipse cx="72" cy="104" rx="62" ry="13" fill="#E3CBA2" stroke="#D2B587" strokeWidth="2" />
      <ellipse cx="72" cy="102" rx="52" ry="9.5" fill="none" stroke="#D2B587" strokeWidth="1.2" opacity="0.7" />
      <ellipse cx="72" cy="102" rx="34" ry="6" fill="none" stroke="#D2B587" strokeWidth="1" opacity="0.5" />

      {/* steam */}
      <path d="M62 26 C 58 18, 64 14, 60 6" stroke="#C98781" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M80 24 C 76 17, 82 13, 78 4" stroke="#C98781" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* cup */}
      <path
        d="M28 34 L 34 88 C 35 98, 45 102, 71 102 C 97 102, 107 98, 108 88 L 114 34 Z"
        fill="#FDF8EC"
        stroke="#E2D3B8"
        strokeWidth="2"
      />
      {/* tea surface */}
      <ellipse cx="71" cy="34" rx="43" ry="9" fill="#D9A85C" stroke="#E2D3B8" strokeWidth="2" />
      <ellipse cx="62" cy="32.5" rx="14" ry="3.4" fill="#EFC685" opacity="0.9" />
      {/* handle */}
      <path
        d="M112 44 C 134 46, 134 74, 110 78"
        fill="none"
        stroke="#F3E9D3"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* heart + speckles */}
      <path
        d="M66 62 c -5 -6, -14 -1, -10 6 c 2 4 7 7 11 10 c 4 -3 9 -6 11 -10 c 4 -7 -5 -12 -10 -6 Z"
        fill="#EFB7AF"
      />
      <circle cx="46" cy="52" r="1.4" fill="#E2D3B8" />
      <circle cx="94" cy="56" r="1.4" fill="#E2D3B8" />
      <circle cx="52" cy="80" r="1.4" fill="#E2D3B8" />
      <circle cx="90" cy="82" r="1.4" fill="#E2D3B8" />
    </svg>
  );
}

export function HeroScene({ beeAlt }: { beeAlt: string }) {
  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[580px] select-none sm:h-[540px]">
      {/* pink cushion, tucked behind */}
      <div
        aria-hidden="true"
        className="absolute bottom-[150px] right-[16%] h-[120px] w-[170px] rounded-[50%] shadow-plush"
        style={{
          background: "radial-gradient(circle at 35% 30%, #F3D9CF, #E5B8A8)",
        }}
      />

      <KnitThrow />

      {/* quilted sage cushion */}
      <div
        aria-hidden="true"
        className="absolute bottom-[72px] left-[16%] h-[120px] w-[260px] rounded-[46%_46%_50%_50%/60%_60%_42%_42%] shadow-plush"
        style={{
          backgroundColor: "#D3DEC6",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 26px), repeating-linear-gradient(-45deg, rgba(122,142,101,0.18) 0 2px, transparent 2px 26px), linear-gradient(150deg, #E0E9D3, #C4D2B2)",
        }}
      >
        <div className="absolute inset-2 rounded-[inherit] border-[1.5px] border-dashed border-white/60" />
      </div>

      {/* Mademoiselle l'Abeille — the real artwork, at home on her cushion */}
      <Image
        src="/illustrations/abeille-sereine/card.webp"
        alt={beeAlt}
        width={800}
        height={800}
        priority
        sizes="(max-width: 640px) 58vw, 300px"
        className="animate-forage absolute bottom-[105px] left-[15%] z-10 w-[45%] rounded-[42%] drop-shadow-[0_18px_18px_rgba(108,74,45,0.16)]"
      />

      <TeaCup />
      <HoneyJar />
      <FlowerPitcher />

      {/* fallen petals on the throw */}
      <span aria-hidden="true" className="absolute bottom-9 left-[30%] h-2.5 w-2.5 rounded-full bg-rose-soft" />
      <span aria-hidden="true" className="absolute bottom-6 left-[54%] h-2 w-2 rounded-full bg-honey-soft" />
      <span aria-hidden="true" className="absolute bottom-11 right-[30%] h-2 w-2 rotate-45 rounded-[40%] bg-rose-soft/80" />
      <span aria-hidden="true" className="absolute bottom-16 left-[44%] h-1.5 w-1.5 rounded-full bg-sage" />
    </div>
  );
}
