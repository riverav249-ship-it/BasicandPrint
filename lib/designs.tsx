// Artes de serigrafía de ejemplo (vectoriales, tintas planas).
// Cada diseño recibe las tintas según el color de la camiseta.
import type { ReactElement } from "react";

export type Inks = { base: string; a: string; b: string };

export function luminance(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function inksFor(shirtHex: string): Inks {
  const light = luminance(shirtHex) > 0.35;
  return light
    ? { base: "#141414", a: "#0E8C8A", b: "#D8452B" }
    : { base: "#F6F6F4", a: "#36D6C8", b: "#FF7A45" };
}

type Art = (i: Inks) => ReactElement;

const FONT = "var(--font-display), system-ui, sans-serif";

const torogoz: Art = (i) => (
  <g>
    {/* cola larga con raquetas */}
    <path d="M86 118 C 78 140, 70 160, 60 182" stroke={i.base} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M94 120 C 92 144, 92 164, 90 186" stroke={i.base} strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="57" cy="186" rx="9" ry="13" fill={i.a} transform="rotate(20 57 186)" />
    <ellipse cx="90" cy="190" rx="9" ry="13" fill={i.a} />
    {/* cuerpo */}
    <path d="M70 70 C 72 44, 110 36, 124 58 C 136 76, 126 110, 100 124 C 84 132, 70 118, 72 100 Z" fill={i.a} />
    <path d="M86 92 C 96 84, 116 86, 122 100 C 112 118, 92 124, 84 112 Z" fill={i.b} />
    {/* cabeza */}
    <circle cx="112" cy="54" r="20" fill={i.a} />
    <path d="M100 48 L 130 46 L 128 58 L 102 58 Z" fill={i.base} />
    <circle cx="116" cy="52" r="3.4" fill={i.b} />
    <path d="M130 58 L 156 64 L 130 68 Z" fill={i.base} />
    {/* ala */}
    <path d="M76 76 C 90 70, 104 78, 100 96 C 90 94, 80 90, 76 76 Z" fill={i.base} opacity="0.9" />
    <text x="100" y="30" textAnchor="middle" fontFamily={FONT} fontSize="15" fontWeight="800" fill={i.base} letterSpacing="3">TOROGOZ</text>
  </g>
);

const volcan: Art = (i) => (
  <g>
    <circle cx="100" cy="86" r="52" fill={i.b} />
    <path d="M28 150 L 84 64 Q 100 56 116 64 L 172 150 Z" fill={i.base} />
    <path d="M84 64 Q 100 56 116 64 L 108 80 Q 100 74 92 80 Z" fill={i.a} />
    <circle cx="96" cy="44" r="9" fill="none" stroke={i.base} strokeWidth="4" />
    <circle cx="112" cy="30" r="12" fill="none" stroke={i.base} strokeWidth="4" />
    <circle cx="92" cy="16" r="6" fill="none" stroke={i.base} strokeWidth="3" />
    <rect x="28" y="156" width="144" height="4" fill={i.base} />
    <text x="100" y="186" textAnchor="middle" fontFamily={FONT} fontSize="22" fontWeight="800" fill={i.base} letterSpacing="4">EL SALVADOR</text>
  </g>
);

const flower = (cx: number, cy: number, r: number, fill: string, core: string) => (
  <g key={`${cx}-${cy}`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={cx} cy={cy - r} rx={r * 0.55} ry={r} fill={fill} transform={`rotate(${a} ${cx} ${cy})`} />
    ))}
    <circle cx={cx} cy={cy} r={r * 0.36} fill={core} />
  </g>
);

const maquilishuat: Art = (i) => (
  <g>
    <path d="M100 176 C 96 140, 70 120, 44 110 M100 150 C 110 124, 136 112, 160 104" stroke={i.base} strokeWidth="5" fill="none" strokeLinecap="round" />
    {flower(60, 78, 20, "#F28DB5", i.base)}
    {flower(112, 58, 24, "#F28DB5", i.base)}
    {flower(150, 92, 17, "#F28DB5", i.base)}
    {flower(88, 112, 14, i.a, i.base)}
    <text x="100" y="196" textAnchor="middle" fontFamily={FONT} fontSize="17" fontWeight="800" fill={i.base} letterSpacing="3">MAQUILISHUAT</text>
  </g>
);

const olas: Art = (i) => (
  <g>
    <circle cx="100" cy="92" r="58" fill={i.b} />
    {[0, 1, 2, 3, 4].map((k) => (
      <rect key={k} x="36" y={62 + k * 9} width="128" height="3.5" fill={i.base} opacity={k % 2 ? 0 : 1} />
    ))}
    <path d="M30 128 Q 50 104 70 128 T 110 128 T 150 128 T 190 128 L 190 150 L 10 150 L 10 128 Q 20 118 30 128 Z" fill={i.a} />
    <path d="M18 146 Q 38 124 58 146 T 98 146 T 138 146 T 178 146" stroke={i.base} strokeWidth="5" fill="none" />
    <text x="100" y="184" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="800" fill={i.base} letterSpacing="5">PACÍFICO</text>
  </g>
);

const cafe: Art = (i) => (
  <g>
    <path d="M78 46 C 70 34, 88 28, 80 16 M100 46 C 92 34, 110 28, 102 16 M122 46 C 114 34, 132 28, 124 16" stroke={i.base} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M56 58 H 144 L 136 128 C 134 138, 126 144, 116 144 H 84 C 74 144, 66 138, 64 128 Z" fill={i.a} />
    <path d="M144 72 C 170 72, 170 110, 140 110" stroke={i.a} strokeWidth="9" fill="none" />
    <rect x="50" y="146" width="100" height="6" rx="3" fill={i.base} />
    <ellipse cx="100" cy="98" rx="14" ry="20" fill={i.b} />
    <path d="M100 80 C 94 92, 106 104, 100 116" stroke={i.a} strokeWidth="3" fill="none" />
    <text x="100" y="180" textAnchor="middle" fontFamily={FONT} fontSize="19" fontWeight="800" fill={i.base} letterSpacing="3">CAFÉ DE ALTURA</text>
  </g>
);

const pupusa: Art = (i) => (
  <g>
    <path d="M70 38 C 62 26, 78 20, 70 8 M100 36 C 92 24, 108 18, 100 6 M130 38 C 122 26, 138 20, 130 8" stroke={i.base} strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="100" cy="82" rx="66" ry="34" fill={i.b} />
    <ellipse cx="100" cy="78" rx="58" ry="27" fill="none" stroke={i.base} strokeWidth="3" strokeDasharray="3 7" />
    {[[76, 72], [120, 70], [98, 90], [134, 88], [66, 90]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill={i.base} />
    ))}
    <text x="100" y="146" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="900" fill={i.a} letterSpacing="1">PUPUSA</text>
    <text x="100" y="180" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="900" fill={i.base} letterSpacing="1">POWER</text>
  </g>
);

const tuLogo: Art = (i) => (
  <g>
    <rect x="30" y="40" width="140" height="110" rx="6" fill="none" stroke={i.base} strokeWidth="4" strokeDasharray="10 8" />
    <path d="M100 66 V 118 M76 92 H 124" stroke={i.a} strokeWidth="8" strokeLinecap="round" />
    <text x="100" y="180" textAnchor="middle" fontFamily={FONT} fontSize="20" fontWeight="800" fill={i.base} letterSpacing="3">TU LOGO AQUÍ</text>
  </g>
);

const promo: Art = (i) => (
  <g>
    <path d="M100 20 L 114 52 L 148 54 L 122 76 L 130 110 L 100 92 L 70 110 L 78 76 L 52 54 L 86 52 Z" fill={i.b} />
    <path d="M40 96 C 36 130, 60 160, 96 168 M160 96 C 164 130, 140 160, 104 168" stroke={i.a} strokeWidth="5" fill="none" />
    {[0, 1, 2, 3].map((k) => (
      <g key={k}>
        <ellipse cx={42 + k * 6} cy={112 + k * 14} rx="5" ry="10" fill={i.a} transform={`rotate(-30 ${42 + k * 6} ${112 + k * 14})`} />
        <ellipse cx={158 - k * 6} cy={112 + k * 14} rx="5" ry="10" fill={i.a} transform={`rotate(30 ${158 - k * 6} ${112 + k * 14})`} />
      </g>
    ))}
    <text x="100" y="134" textAnchor="middle" fontFamily={FONT} fontSize="30" fontWeight="900" fill={i.base}>PROMO</text>
    <text x="100" y="160" textAnchor="middle" fontFamily={FONT} fontSize="22" fontWeight="800" fill={i.base} letterSpacing="4">2027</text>
  </g>
);


/* Muestra de portada: "TU DISEÑO AQUÍ" con corona y trazo de pincel cian */
const tuDisenoAqui: Art = (i) => (
  <g transform="rotate(-9 100 100)">
    <path d="M118 24 L 126 40 L 136 28 L 146 40 L 154 24 L 150 48 L 122 48 Z" fill="none" stroke={i.base} strokeWidth="4" strokeLinejoin="round" />
    <text x="40" y="76" fontFamily={FONT} fontSize="46" fontWeight="900" fill={i.base}>TU</text>
    <text x="34" y="122" fontFamily={FONT} fontSize="50" fontWeight="900" fill={i.base} letterSpacing="-1">DISEÑO</text>
    <text x="52" y="166" fontFamily={FONT} fontSize="50" fontWeight="900" fill={i.base}>AQUÍ</text>
    <path d="M28 182 C 70 170, 120 168, 176 160" stroke="#F2643A" strokeWidth="11" strokeLinecap="round" fill="none" />
    <path d="M44 192 C 84 184, 124 182, 168 176" stroke={i.base} strokeWidth="4" strokeLinecap="round" fill="none" />
  </g>
);

export const ARTS: Record<string, Art> = {
  torogoz,
  volcan,
  maquilishuat,
  olas,
  cafe,
  pupusa,
  "tu-logo": tuLogo,
  promo,
  "tu-diseno-aqui": tuDisenoAqui,
};

export function DesignArt({ slug, inks }: { slug: string; inks: Inks }) {
  const art = ARTS[slug] ?? tuLogo;
  return art(inks);
}
