"use client";
import { DesignArt, inksFor, luminance } from "@/lib/designs";

/* Silueta de camiseta de cuello redondo, con dobladillo curvo */
const BODY =
  "M106 20 C 120 34, 180 34, 194 20 L 248 40 C 258 44, 266 52, 271 62 L 297 128 C 298 131, 297 134, 294 135 L 254 150 C 251 151, 248 150, 247 147 L 238 124 C 237 190, 238 256, 240 318 C 240 324, 236 328, 230 329 C 178 334, 122 334, 70 329 C 64 328, 60 324, 60 318 C 62 256, 63 190, 62 124 L 53 147 C 52 150, 49 151, 46 150 L 6 135 C 3 134, 2 131, 3 128 L 29 62 C 34 52, 42 44, 52 40 Z";

const NECK = "M106 20 C 120 34, 180 34, 194 20";
const NECK_BACK = "M106 20 C 122 27, 178 27, 194 20";
const BODY_BACK = BODY.replace("M106 20 C 120 34, 180 34, 194 20", "M106 20 C 122 27, 178 27, 194 20");

/* Mangas (para sombrearlas aparte del cuerpo) */
const SLEEVE_L = "M52 40 C 42 44, 34 52, 29 62 L 3 128 C 2 131, 3 134, 6 135 L 46 150 C 49 151, 52 150, 53 147 L 62 124 C 60 96, 57 66, 52 40 Z";
const SLEEVE_R = "M248 40 C 258 44, 266 52, 271 62 L 297 128 C 298 131, 297 134, 294 135 L 254 150 C 251 151, 248 150, 247 147 L 238 124 C 240 96, 243 66, 248 40 Z";

/* Filtros y degradados compartidos por todas las camisetas de la página */
export function ShirtDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="bp-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="bp-soft-s" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id="bp-soft-xs" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="bp-soft-xl" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        {/* Tejido de punto: grano fino y columnas verticales del jersey */}
        <filter id="bp-knit" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6 0.55" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.2 -0.04" />
        </filter>
        {/* Tinta sobre tela: se desplaza con la trama y pierde un poco de cuerpo */}
        <filter id="bp-print" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="11" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.32" result="holes" />
          <feComposite in="d" in2="holes" operator="in" result="p" />
          <feComponentTransfer in="p">
            <feFuncA type="linear" slope="0.95" />
          </feComponentTransfer>
        </filter>
        {/* Luz de estudio: arriba a la izquierda */}
        <linearGradient id="bp-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bp-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="bp-sleeve-l" x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="bp-sleeve-r" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#000" stopOpacity="0.32" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.34" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export type Placement = "frente" | "pecho" | "espalda";
export type ShirtView = "front" | "back";

type Box = { x: number; y: number; s: number };
const BOX: Record<Placement, Box> = {
  frente: { x: 90, y: 72, s: 120 },
  pecho: { x: 172, y: 70, s: 46 },
  espalda: { x: 80, y: 56, s: 140 },
};
/* Con pecho + frente, el diseño grande baja para no chocar con el del pecho */
const FRENTE_BAJO: Box = { x: 100, y: 128, s: 100 };

type Props = {
  color: string;
  design?: string | null;
  designImage?: string | null;
  logoUrl?: string | null;
  /** Ubicación única (compatibilidad). */
  placement?: Placement;
  /** Hasta dos ubicaciones a la vez. */
  placements?: Placement[];
  /** Vista de la prenda. Por defecto, la que muestra la impresión. */
  view?: ShirtView;
  inkKey?: string | number;
  className?: string;
  title?: string;
  animate?: boolean;
  /** Capas propias (estudio): se dibujan donde va la tinta, bajo pliegues y tejido. */
  children?: React.ReactNode;
  /** Controles por encima de la prenda (selección, asas). */
  overlay?: React.ReactNode;
};

/** Camiseta con luz de estudio, volumen en los bordes, mangas, pliegues, tejido y la impresión bajo los pliegues. */
export default function Shirt({
  color,
  design,
  designImage,
  logoUrl,
  placement = "frente",
  placements,
  view,
  inkKey,
  className,
  title,
  animate,
  children,
  overlay,
}: Props) {
  const places = placements?.length ? placements : [placement];
  const side: ShirtView = view ?? (places.every((p) => p === "espalda") ? "back" : "front");
  const back = side === "back";
  const shown = places.filter((p) => (back ? p === "espalda" : p !== "espalda"));
  const img = logoUrl || designImage;
  const shape = back ? BODY_BACK : BODY;
  const clip = `bp-clip-${color.replace("#", "")}${back ? "-b" : ""}`;
  const lum = luminance(color);
  const dark = lum < 0.12;
  const light = lum > 0.6;
  const inks = inksFor(color);
  // Intensidades: en telas oscuras se notan más los brillos; en claras, las sombras.
  const sh = light ? 0.32 : dark ? 0.6 : 0.44;
  const hl = dark ? 0.26 : light ? 0.5 : 0.32;

  const boxFor = (p: Placement): Box => (p === "frente" && shown.includes("pecho") ? FRENTE_BAJO : BOX[p]);

  return (
    <svg viewBox="0 0 300 340" className={className} role="img" aria-label={title}>
      <defs>
        <clipPath id={clip}>
          <path d={shape} />
        </clipPath>
      </defs>

      {/* interior trasero del cuello (solo vista frontal) */}
      {!back && (
        <>
          <path d="M106 20 C 120 34, 180 34, 194 20 C 186 11, 114 11, 106 20 Z" fill={color} />
          <path d="M106 20 C 120 34, 180 34, 194 20 C 186 11, 114 11, 106 20 Z" fill="#000" fillOpacity={0.5} />
          <rect x="140" y="17" width="20" height="8" rx="1.2" fill="#fff" fillOpacity={0.8} />
          <path d="M143 20.5 h14 M143 22.5 h9" stroke="#000" strokeOpacity={0.35} strokeWidth="0.8" />
        </>
      )}

      <path d={shape} fill={color} />

      <g clipPath={`url(#${clip})`}>
        {children}
        {/* impresión: queda bajo las sombras y el tejido */}
        {(design || img) &&
          shown.map((p) => {
            const box = boxFor(p);
            return (
              <g key={`${p}-${design}-${img}-${inkKey ?? ""}`} className={animate ? "ink-pull" : undefined}>
                <g filter="url(#bp-print)">
                  {img ? (
                    <image href={img} x={box.x} y={box.y} width={box.s} height={box.s} preserveAspectRatio="xMidYMid meet" />
                  ) : (
                    <g transform={`translate(${box.x} ${box.y}) scale(${box.s / 200})`}>
                      <DesignArt slug={design!} inks={inks} />
                    </g>
                  )}
                </g>
              </g>
            );
          })}

        <g pointerEvents="none">
        {/* mangas: giran hacia atrás, reciben menos luz */}
        <g style={{ mixBlendMode: "multiply" }}>
          <path d={SLEEVE_L} fill="url(#bp-sleeve-l)" />
          <path d={SLEEVE_R} fill="url(#bp-sleeve-r)" />
        </g>

        {/* luz general del estudio */}
        <rect width="300" height="340" fill="url(#bp-shade)" style={{ mixBlendMode: "multiply" }} opacity={sh * 1.1} />
        <rect width="300" height="340" fill="url(#bp-light)" style={{ mixBlendMode: "screen" }} opacity={hl * 1.4} />

        {/* pliegues y caída de la tela */}
        <g style={{ mixBlendMode: "multiply" }} fill="#000">
          <path d="M60 110 C 50 180, 54 260, 62 330 L 30 330 L 30 110 Z" opacity={sh} filter="url(#bp-soft)" transform="translate(12 0)" />
          <path d="M240 110 C 250 180, 246 260, 238 330 L 270 330 L 270 110 Z" opacity={sh * 1.2} filter="url(#bp-soft)" transform="translate(-12 0)" />
          {/* costura de sisa: la manga se hunde donde se une al cuerpo */}
          <path d="M52 42 C 57 70, 60 98, 62 124" stroke="#000" strokeWidth="5" fill="none" opacity={sh * 0.9} filter="url(#bp-soft-s)" />
          <path d="M248 42 C 243 70, 240 98, 238 124" stroke="#000" strokeWidth="6" fill="none" opacity={sh} filter="url(#bp-soft-s)" />
          {/* arrugas de axila que caen en diagonal */}
          <path d="M66 126 C 90 140, 104 160, 112 186" stroke="#000" strokeWidth="7" fill="none" opacity={sh * 0.75} filter="url(#bp-soft-s)" />
          <path d="M234 126 C 210 142, 196 160, 190 184" stroke="#000" strokeWidth="7" fill="none" opacity={sh * 0.8} filter="url(#bp-soft-s)" />
          <path d="M70 142 C 88 156, 96 172, 100 196" stroke="#000" strokeWidth="4" fill="none" opacity={sh * 0.5} filter="url(#bp-soft-s)" />
          <path d="M230 142 C 214 156, 206 172, 204 194" stroke="#000" strokeWidth="4" fill="none" opacity={sh * 0.5} filter="url(#bp-soft-s)" />
          <path d="M72 160 C 84 172, 90 186, 92 204" stroke="#000" strokeWidth="2.5" fill="none" opacity={sh * 0.4} filter="url(#bp-soft-xs)" />
          <path d="M228 160 C 216 172, 210 186, 208 204" stroke="#000" strokeWidth="2.5" fill="none" opacity={sh * 0.45} filter="url(#bp-soft-xs)" />
          {/* caída vertical hacia el dobladillo */}
          <path d="M118 236 C 124 270, 118 300, 112 332" stroke="#000" strokeWidth="12" fill="none" opacity={sh * 0.4} filter="url(#bp-soft)" />
          <path d="M186 228 C 178 262, 186 300, 196 332" stroke="#000" strokeWidth="10" fill="none" opacity={sh * 0.5} filter="url(#bp-soft)" />
          <path d="M150 262 C 154 290, 150 312, 150 334" stroke="#000" strokeWidth="6" fill="none" opacity={sh * 0.3} filter="url(#bp-soft)" />
          <path d="M92 290 C 96 306, 96 320, 94 332" stroke="#000" strokeWidth="4" fill="none" opacity={sh * 0.35} filter="url(#bp-soft-s)" />
          <path d="M214 286 C 208 304, 210 318, 214 332" stroke="#000" strokeWidth="4" fill="none" opacity={sh * 0.35} filter="url(#bp-soft-s)" />
          {/* dobladillo con peso */}
          <path d="M60 316 C 120 326, 180 326, 240 316 L 240 334 L 60 334 Z" opacity={sh * 0.9} filter="url(#bp-soft-s)" />
          {/* sombra bajo el cuello */}
          <path d="M112 30 C 124 50, 176 50, 188 30 L 188 42 C 170 58, 130 58, 112 42 Z" opacity={sh * 0.7} filter="url(#bp-soft-s)" />
          {/* mangas: pliegue en el hombro y en el puño */}
          <path d="M30 70 C 40 96, 44 116, 48 146" stroke="#000" strokeWidth="10" fill="none" opacity={sh * 0.5} filter="url(#bp-soft)" />
          <path d="M270 70 C 260 96, 256 116, 252 146" stroke="#000" strokeWidth="10" fill="none" opacity={sh * 0.6} filter="url(#bp-soft)" />
          <path d="M18 104 C 30 114, 42 126, 50 146" stroke="#000" strokeWidth="3" fill="none" opacity={sh * 0.5} filter="url(#bp-soft-s)" />
          <path d="M282 104 C 270 114, 258 126, 250 146" stroke="#000" strokeWidth="3" fill="none" opacity={sh * 0.55} filter="url(#bp-soft-s)" />
          <path d="M8 124 L 50 140" stroke="#000" strokeWidth="4" opacity={sh * 0.45} filter="url(#bp-soft-xs)" />
          <path d="M292 124 L 250 140" stroke="#000" strokeWidth="4" opacity={sh * 0.5} filter="url(#bp-soft-xs)" />
        </g>

        {/* volumen: los bordes de la prenda se alejan de la luz */}
        <path d={shape} fill="none" stroke="#000" strokeWidth="26" opacity={sh * 0.55} filter="url(#bp-soft)" style={{ mixBlendMode: "multiply" }} />

        {/* brillos sobre las crestas de la tela */}
        <g style={{ mixBlendMode: "screen" }} fill="#fff">
          <ellipse cx="140" cy="112" rx="64" ry="60" opacity={hl * 0.55} filter="url(#bp-soft-xl)" />
          <path d="M78 136 C 96 150, 108 170, 116 196" stroke="#fff" strokeWidth="5" fill="none" opacity={hl * 0.85} filter="url(#bp-soft-s)" />
          <path d="M222 138 C 206 152, 196 170, 194 194" stroke="#fff" strokeWidth="4" fill="none" opacity={hl * 0.5} filter="url(#bp-soft-s)" />
          <path d="M134 240 C 140 272, 134 304, 130 332" stroke="#fff" strokeWidth="8" fill="none" opacity={hl * 0.6} filter="url(#bp-soft)" />
          <path d="M170 236 C 164 268, 168 300, 176 332" stroke="#fff" strokeWidth="6" fill="none" opacity={hl * 0.4} filter="url(#bp-soft)" />
          <path d="M40 60 C 60 50, 84 44, 104 30" stroke="#fff" strokeWidth="8" fill="none" opacity={hl * 0.65} filter="url(#bp-soft)" />
          <path d="M22 88 C 30 100, 36 112, 40 126" stroke="#fff" strokeWidth="5" fill="none" opacity={hl * 0.5} filter="url(#bp-soft-s)" />
          <path d="M260 60 C 240 50, 216 44, 196 30" stroke="#fff" strokeWidth="6" fill="none" opacity={hl * 0.3} filter="url(#bp-soft)" />
        </g>

        {/* tejido */}
        <rect width="300" height="340" filter="url(#bp-knit)" style={{ mixBlendMode: "overlay" }} />

        {/* costuras: puños, dobladillo doble y costados */}
        <g fill="none" stroke="#000" strokeOpacity={dark ? 0.55 : 0.24} strokeWidth="0.9" strokeDasharray="2.2 2">
          <path d="M11 121 L 49 136" />
          <path d="M289 121 L 251 136" />
          <path d="M64 318 C 120 324, 180 324, 236 318" />
          <path d="M64 312 C 120 318, 180 318, 236 312" />
        </g>
        <g fill="none" stroke="#fff" strokeOpacity={dark ? 0.12 : 0.28} strokeWidth="0.7">
          <path d="M64 319 C 120 325, 180 325, 236 319" />
        </g>
        <g fill="none" stroke="#000" strokeOpacity={dark ? 0.45 : 0.18} strokeWidth="1.2">
          <path d="M62 124 C 58 96, 52 70, 52 40" />
          <path d="M238 124 C 242 96, 248 70, 248 40" />
        </g>
        </g>
      </g>

      {/* cuello acanalado con grosor */}
      <path d={back ? NECK_BACK : NECK} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={back ? NECK_BACK : NECK} stroke="#000" strokeOpacity={dark ? 0.4 : 0.18} strokeWidth="10" fill="none" strokeDasharray="0.9 1.5" />
      <path d={back ? NECK_BACK : NECK} stroke="#fff" strokeOpacity={dark ? 0.1 : 0.25} strokeWidth="1.2" fill="none" transform="translate(0 -3.5)" />
      <path
        d={back ? "M103 24 C 120 32, 180 32, 197 24" : "M103 25 C 118 41, 182 41, 197 25"}
        stroke="#000"
        strokeOpacity={dark ? 0.55 : 0.22}
        strokeWidth="1.6"
        fill="none"
      />
      {overlay}
    </svg>
  );
}
