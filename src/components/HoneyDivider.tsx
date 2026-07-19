/**
 * The threshold between two rooms: a golden flow of honey lies along the
 * seam — wavy above, dripping below — while little pollen balls let go
 * and pollen powder dusts the wall beneath. Sits at the very top of the
 * room being entered, painting over its wall wash; the cream cap above
 * the flow keeps it seamless with the room left behind.
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
        <linearGradient id="honey-flow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4d88e" />
          <stop offset="0.55" stopColor="#e9bd5c" />
          <stop offset="1" stopColor="#dda23c" />
        </linearGradient>
        <radialGradient id="pollen-ball" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#f8e1a0" />
          <stop offset="0.6" stopColor="#e9bd5c" />
          <stop offset="1" stopColor="#d29a34" />
        </radialGradient>
      </defs>

      {/* cream cap: the room above, down to the honey's wavy upper edge */}
      <path
        fill="#f8efdd"
        d="M0,0 H1440 V6 C1410,7 1380,4 1300,6 C1220,8 1160,4 1080,7
        C1000,9 940,4 860,7 C780,8 720,3 640,6 C560,8 500,4 420,7
        C340,9 280,4 200,7 C120,9 60,3 0,6 Z"
      />

      {/* the honey flow: wavy above, slow drips below */}
      <path
        fill="url(#honey-flow)"
        d="M0,6 C60,3 120,9 200,7 C280,4 340,9 420,7 C500,4 560,8 640,6
        C720,3 780,8 860,7 C940,4 1000,9 1080,7 C1160,4 1220,8 1300,6
        C1380,4 1410,7 1440,6 V12
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
      {/* gloss along the crest of the flow */}
      <path
        fill="none"
        stroke="#fbeabc"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
        d="M30,9 C120,12 220,10 330,12 C460,14 560,10 700,12 C840,14 960,10 1090,12 C1220,14 1330,10 1410,11"
      />

      {/* pollen balls letting go beneath the deepest drips */}
      <g>
        <circle cx="170" cy="41" r="4.6" fill="url(#pollen-ball)" />
        <circle cx="168.4" cy="39.2" r="1.2" fill="#fdf2cf" opacity="0.8" />
        <circle cx="171.8" cy="42.6" r="0.8" fill="#b9861f" opacity="0.7" />
        <circle cx="168.2" cy="43" r="0.7" fill="#b9861f" opacity="0.6" />

        <circle cx="620" cy="45" r="5.6" fill="url(#pollen-ball)" />
        <circle cx="618" cy="42.8" r="1.4" fill="#fdf2cf" opacity="0.8" />
        <circle cx="622.4" cy="46.6" r="0.9" fill="#b9861f" opacity="0.7" />
        <circle cx="617.6" cy="47.2" r="0.8" fill="#b9861f" opacity="0.6" />
        <circle cx="621.6" cy="43.4" r="0.7" fill="#b9861f" opacity="0.5" />
        <circle cx="636" cy="52" r="2.2" fill="url(#pollen-ball)" />

        <circle cx="1072" cy="49" r="6.2" fill="url(#pollen-ball)" />
        <circle cx="1069.6" cy="46.4" r="1.5" fill="#fdf2cf" opacity="0.8" />
        <circle cx="1074.8" cy="50.8" r="1" fill="#b9861f" opacity="0.7" />
        <circle cx="1069.4" cy="51.6" r="0.8" fill="#b9861f" opacity="0.6" />
        <circle cx="1074" cy="47" r="0.7" fill="#b9861f" opacity="0.5" />
        <circle cx="1056" cy="55" r="2" fill="url(#pollen-ball)" />
      </g>

      {/* pollen powder dusting the wall beneath the flow */}
      <g fill="#d9a63c">
        <circle cx="52" cy="24" r="1.2" opacity="0.35" />
        <circle cx="96" cy="32" r="1.8" opacity="0.3" />
        <circle cx="150" cy="52" r="1" opacity="0.3" />
        <circle cx="188" cy="50" r="1.4" opacity="0.35" />
        <circle cx="238" cy="27" r="1.1" opacity="0.4" />
        <circle cx="300" cy="36" r="1.9" opacity="0.28" />
        <circle cx="352" cy="24" r="1" opacity="0.4" />
        <circle cx="405" cy="42" r="1.5" opacity="0.3" />
        <circle cx="470" cy="28" r="1.2" opacity="0.35" />
        <circle cx="530" cy="38" r="1" opacity="0.3" />
        <circle cx="586" cy="30" r="1.6" opacity="0.32" />
        <circle cx="604" cy="54" r="1.1" opacity="0.35" />
        <circle cx="662" cy="26" r="1.3" opacity="0.35" />
        <circle cx="718" cy="40" r="1.8" opacity="0.26" />
        <circle cx="774" cy="30" r="1" opacity="0.4" />
        <circle cx="836" cy="44" r="1.4" opacity="0.3" />
        <circle cx="898" cy="26" r="1.2" opacity="0.38" />
        <circle cx="948" cy="38" r="1" opacity="0.3" />
        <circle cx="1002" cy="30" r="1.7" opacity="0.3" />
        <circle cx="1046" cy="26" r="1" opacity="0.35" />
        <circle cx="1096" cy="58" r="1.2" opacity="0.32" />
        <circle cx="1148" cy="34" r="1.5" opacity="0.32" />
        <circle cx="1204" cy="26" r="1.1" opacity="0.38" />
        <circle cx="1262" cy="42" r="1.6" opacity="0.28" />
        <circle cx="1318" cy="30" r="1" opacity="0.36" />
        <circle cx="1372" cy="44" r="1.3" opacity="0.3" />
        <circle cx="1414" cy="26" r="1.1" opacity="0.35" />
      </g>
    </svg>
  );
}
