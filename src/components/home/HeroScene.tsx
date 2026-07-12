import Image from "next/image";

/**
 * The illustrated domestic scene beside the welcome text: a woven rug,
 * a cushion, the real Mademoiselle l’Abeille, a warm cup and a honey jar.
 * Everything except the artwork is lightweight CSS/SVG.
 */
export function HeroScene({ beeAlt }: { beeAlt: string }) {
  return (
    <div
      aria-hidden="false"
      className="relative mx-auto h-[420px] w-full max-w-[560px] select-none sm:h-[520px]"
    >
      {/* rug */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 h-[170px] w-[94%] -translate-x-1/2 rounded-[50%_50%_44%_44%/62%_62%_38%_38%] shadow-plush"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.16) 0 3px, rgba(0,0,0,0.014) 3px 6px), linear-gradient(135deg, #F3E7D3, #E7DDC7)",
        }}
      />

      {/* cushion */}
      <div
        aria-hidden="true"
        className="absolute bottom-[86px] left-[14%] h-[130px] w-[250px] rounded-[50%] shadow-plush"
        style={{
          background: "linear-gradient(145deg, #E9EFE2, #CBD7C0)",
        }}
      >
        <div className="absolute inset-2 rounded-[50%] border border-dashed border-white/50" />
      </div>

      {/* Mademoiselle l’Abeille — the real artwork */}
      <Image
        src="/illustrations/abeille-sereine/card.webp"
        alt={beeAlt}
        width={800}
        height={800}
        priority
        sizes="(max-width: 640px) 60vw, 320px"
        className="animate-float absolute bottom-[120px] left-[13%] z-10 w-[46%] rounded-[38%] drop-shadow-[0_18px_18px_rgba(108,74,45,0.14)]"
      />

      {/* cup with a heart */}
      <div
        aria-hidden="true"
        className="absolute bottom-[70px] right-[22%] h-[82px] w-[100px] rounded-[16px_16px_26px_26px] shadow-plush"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.6), #D9E7EF)",
        }}
      >
        <span className="absolute -right-[30px] top-[14px] h-[42px] w-[42px] rounded-r-full border-[10px] border-l-0 border-sky" />
        <span className="absolute inset-0 grid place-items-center text-2xl text-rose">
          ♡
        </span>
        {/* steam */}
        <span className="absolute -top-5 left-1/2 h-4 w-px -translate-x-3 rounded bg-rose/20" />
        <span className="absolute -top-6 left-1/2 h-5 w-px translate-x-1 rounded bg-rose/15" />
      </div>

      {/* honey jar */}
      <div
        aria-hidden="true"
        className="absolute bottom-[66px] right-[2%] h-[96px] w-[112px] rounded-[22px_22px_30px_30px] shadow-plush"
        style={{ background: "linear-gradient(#F6D98F, #E2B851)" }}
      >
        <span className="absolute -top-[14px] left-2 right-2 h-[22px] rounded-[12px] bg-paper" />
        <span className="font-display absolute inset-x-0 top-[38px] text-center text-lg font-semibold text-[#FFF8E8]">
          miel
        </span>
      </div>

      {/* flowers */}
      <svg
        aria-hidden="true"
        viewBox="0 0 180 250"
        className="absolute -right-3 bottom-[60px] hidden h-[230px] w-[170px] sm:block"
      >
        <g strokeLinecap="round">
          <path d="M50 250 C48 190 44 140 52 92" stroke="#A9B69E" strokeWidth="3" fill="none" />
          <path d="M96 250 C98 180 102 120 94 52" stroke="#A9B69E" strokeWidth="3" fill="none" />
          <path d="M140 250 C142 200 146 160 138 122" stroke="#A9B69E" strokeWidth="3" fill="none" />
        </g>
        <g>
          <circle cx="52" cy="80" r="22" fill="#FFF6DD" />
          <circle cx="52" cy="80" r="9" fill="#E3B351" />
          <circle cx="94" cy="42" r="24" fill="#E4EDF3" />
          <circle cx="94" cy="42" r="9" fill="#E3B351" />
          <circle cx="138" cy="112" r="20" fill="#F1E9CF" />
          <circle cx="138" cy="112" r="8" fill="#C98781" />
        </g>
        <g fill="#B9C7AC">
          <ellipse cx="40" cy="170" rx="12" ry="5" transform="rotate(-30 40 170)" />
          <ellipse cx="108" cy="150" rx="12" ry="5" transform="rotate(25 108 150)" />
        </g>
      </svg>

      {/* fallen petals */}
      <span aria-hidden="true" className="absolute bottom-10 left-[30%] h-2.5 w-2.5 rounded-full bg-rose-soft" />
      <span aria-hidden="true" className="absolute bottom-7 left-[52%] h-2 w-2 rounded-full bg-honey-soft" />
      <span aria-hidden="true" className="absolute bottom-12 right-[30%] h-2 w-2 rounded-full bg-rose-soft/80" />
    </div>
  );
}
