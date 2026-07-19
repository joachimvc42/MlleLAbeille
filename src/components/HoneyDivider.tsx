/**
 * The threshold between two rooms: the cream of the room above stretches
 * over the seam like slowly-flowing honey, a few golden drops letting go,
 * pollen drifting beneath. Replaces the old scalloped hem. Sits at the
 * very top of the room being entered, painting over its wall wash.
 */
export function HoneyDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={`block h-[58px] w-full ${className}`}
    >
      <defs>
        <linearGradient id="honey-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4d488" />
          <stop offset="1" stopColor="#dfa93f" />
        </linearGradient>
      </defs>

      {/* the cream of the room above, ending in a slow drip line */}
      <path
        fill="#f8efdd"
        d="M0,0 H1440 V12
        C1420,12 1414,20 1400,20 C1386,20 1384,11 1352,11
        C1318,11 1316,30 1296,30 C1276,30 1274,12 1240,12
        C1206,12 1204,22 1184,22 C1164,22 1162,10 1128,10
        C1096,10 1094,38 1072,38 C1050,38 1048,12 1012,12
        C978,12 976,20 956,20 C936,20 934,10 900,10
        C868,10 866,26 846,26 C826,26 824,11 788,11
        C754,11 752,18 732,18 C712,18 710,10 676,10
        C644,10 642,34 620,34 C598,34 596,12 560,12
        C526,12 524,21 504,21 C484,21 482,10 448,10
        C416,10 414,27 394,27 C374,27 372,11 336,11
        C302,11 300,19 280,19 C260,19 258,10 224,10
        C192,10 190,30 170,30 C150,30 148,11 112,11
        C78,11 76,17 56,17 C36,17 34,10 0,12 Z"
      />

      {/* golden drops letting go beneath the deepest drips */}
      <g>
        <path
          fill="url(#honey-drop)"
          d="M1072 44 C1068 49 1066.5 52 1066.5 54.5 A5.5 5.5 0 0 0 1077.5 54.5 C1077.5 52 1076 49 1072 44 Z"
        />
        <ellipse cx="1070" cy="53.5" rx="1.4" ry="2.2" fill="#fffdf4" opacity="0.5" />
        <path
          fill="url(#honey-drop)"
          d="M620 40 C616 45 614.5 48 614.5 50.5 A5.5 5.5 0 0 0 625.5 50.5 C625.5 48 624 45 620 40 Z"
        />
        <ellipse cx="618" cy="49.5" rx="1.4" ry="2.2" fill="#fffdf4" opacity="0.5" />
        <path
          fill="url(#honey-drop)"
          d="M170 36 C166.8 40 165.5 42.6 165.5 44.8 A4.5 4.5 0 0 0 174.5 44.8 C174.5 42.6 173.2 40 170 36 Z"
        />
        <ellipse cx="168.4" cy="43.8" rx="1.1" ry="1.8" fill="#fffdf4" opacity="0.5" />
      </g>

      {/* pollen drifting under the seam */}
      <g fill="#d9a63c">
        <circle cx="90" cy="26" r="2" opacity="0.35" />
        <circle cx="255" cy="38" r="2.5" opacity="0.3" />
        <circle cx="420" cy="34" r="2" opacity="0.4" />
        <circle cx="555" cy="30" r="1.8" opacity="0.35" />
        <circle cx="700" cy="42" r="2.6" opacity="0.28" />
        <circle cx="760" cy="24" r="1.6" opacity="0.4" />
        <circle cx="930" cy="28" r="2" opacity="0.33" />
        <circle cx="1010" cy="44" r="2.2" opacity="0.3" />
        <circle cx="1160" cy="30" r="2.4" opacity="0.35" />
        <circle cx="1250" cy="40" r="1.8" opacity="0.3" />
        <circle cx="1330" cy="46" r="1.5" opacity="0.28" />
        <circle cx="1390" cy="28" r="2.2" opacity="0.35" />
      </g>
    </svg>
  );
}
