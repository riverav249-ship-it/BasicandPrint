"use client";
import { useId } from "react";
import { DesignArt, inksFor, luminance } from "@/lib/designs";

/* Silueta de camiseta de cuello redondo, con dobladillo curvo */
const BODY =
  "M106 20 C 120 34, 180 34, 194 20 L 248 40 C 258 44, 266 52, 271 62 L 297 128 C 298 131, 297 134, 294 135 L 254 150 C 251 151, 248 150, 247 147 L 238 124 C 237 190, 238 256, 240 318 C 240 324, 236 328, 230 329 C 178 334, 122 334, 70 329 C 64 328, 60 324, 60 318 C 62 256, 63 190, 62 124 L 53 147 C 52 150, 49 151, 46 150 L 6 135 C 3 134, 2 131, 3 128 L 29 62 C 34 52, 42 44, 52 40 Z";

const NECK = "M106 20 C 120 34, 180 34, 194 20";
const NECK_BACK = "M106 20 C 122 27, 178 27, 194 20";

const BODY_BACK = BODY.replace("M106 20 C 120 34, 180 34, 194 20", "M106 20 C 122 27, 178 27, 194 20");

/* Filtros y texturas compartidos por todas las camisetas de la página */
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
        <filter id="bp-soft-xl" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        {/* Tejido de punto: ruido fino en gris */}
        <filter id="bp-knit" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.3 0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.34 -0.08"
          />
        </filter>
        {/* Tinta sobre tela: leve desplazamiento por la trama */}
        <filter id="bp-print" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feComponentTransfer in="d">
            <feFuncA type="linear" slope="0.94" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}

export type Placement = "frente" | "pecho" | "espalda";

const BOX: Record<Placement, { x: number; y: number; s: number }> = {
  frente: { x: 90, y: 72, s: 120 },
  pecho: { x: 172, y: 70, s: 46 },
  espalda: { x: 80, y: 56, s: 140 },
};

type Props = {
  color: string;
  /** Foto real de la camiseta (vista frontal, fondo transparente). */
  photo?: string | null;
  design?: string | null;
  designImage?: string | null;
  logoUrl?: string | null;
  placement?: Placement;
  inkKey?: string | number;
  className?: string;
  title?: string;
  animate?: boolean;
};

/* La foto ocupa 300×312.5 dentro del lienzo 300×340 (fotos de 720×750). */
const PHOTO = { x: 0, y: 12, width: 300, height: 312.5 };
/* Mapa de sombras compartido por todas las fotos (mismo molde): oscurece la tinta en los pliegues. */
const SHADE = "/catalogo/camisetas/sombra.webp";

function PhotoShirt({ photo, design, designImage, logoUrl, placement = "frente", inkKey, className, title, animate, color }: Props & { photo: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const img = logoUrl || designImage;
  const box = BOX[placement];
  const inks = inksFor(color);
  const hasPrint = Boolean(design || img);
  const printArt = hasPrint ? (
    img ? (
      <image href={img} x={box.x} y={box.y} width={box.s} height={box.s} preserveAspectRatio="xMidYMid meet" />
    ) : (
      <g transform={`translate(${box.x} ${box.y}) scale(${box.s / 200})`}>
        <DesignArt slug={design!} inks={inks} />
      </g>
    )
  ) : null;

  return (
    <svg viewBox="0 0 300 340" className={className} role="img" aria-label={title}>
      <defs>
        {/* silueta de la camiseta: la tinta no sale de la tela */}
        <mask id={`ps-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="340" style={{ maskType: "alpha" }}>
          <image href={photo} {...PHOTO} />
        </mask>
        {/* forma de la tinta: los pliegues solo se aplican donde hay impresión */}
        <mask id={`pi-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="340" style={{ maskType: "alpha" }}>
          {printArt}
        </mask>
      </defs>
      <image href={photo} {...PHOTO} />
      {hasPrint && (
        <g mask={`url(#ps-${uid})`}>
          <g key={`${design}-${img}-${placement}-${inkKey ?? ""}`} className={animate ? "ink-pull" : undefined}>
            <g filter="url(#bp-print)">{printArt}</g>
            <g mask={`url(#pi-${uid})`} style={{ mixBlendMode: "multiply" }}>
              <image href={SHADE} {...PHOTO} />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}

/** Camiseta con sombreado de pliegues, textura de tejido y la impresión debajo de los pliegues. */
export default function Shirt(props: Props) {
  // Con foto real se usa la foto (vista frontal). La espalda aún usa el dibujo hasta tener fotos de espalda.
  if (props.photo && props.placement !== "espalda") return <PhotoShirt {...props} photo={props.photo} />;
  return <DrawnShirt {...props} />;
}

function DrawnShirt({
  color,
  design,
  designImage,
  logoUrl,
  placement = "frente",
  inkKey,
  className,
  title,
  animate,
}: Props) {
  const img = logoUrl || designImage;
  const box = BOX[placement];
  const back = placement === "espalda";
  const shape = back ? BODY_BACK : BODY;
  const clip = `bp-clip-${color.replace("#", "")}${back ? "-b" : ""}`;
  const lum = luminance(color);
  const dark = lum < 0.12;
  const light = lum > 0.6;
  const inks = inksFor(color);
  // Intensidades: en telas oscuras se notan más los brillos; en claras, las sombras.
  const sh = light ? 0.34 : dark ? 0.55 : 0.42;
  const hl = dark ? 0.2 : light ? 0.55 : 0.28;
  

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
          <path d="M106 20 C 120 34, 180 34, 194 20 C 186 12, 114 12, 106 20 Z" fill={color} />
          <path d="M106 20 C 120 34, 180 34, 194 20 C 186 12, 114 12, 106 20 Z" fill="#000" fillOpacity={0.42} />
          <rect x="141" y="18" width="18" height="7" rx="1" fill="#fff" fillOpacity={0.75} />
        </>
      )}

      <path d={shape} fill={color} />

      <g clipPath={`url(#${clip})`}>
        {/* impresión */}
        {(design || img) && (
          <g key={`${design}-${img}-${placement}-${inkKey ?? ""}`} className={animate ? "ink-pull" : undefined}>
            <g filter="url(#bp-print)">
              {img ? (
                <image
                  href={img}
                  x={box.x}
                  y={box.y}
                  width={box.s}
                  height={box.s}
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : (
                <g transform={`translate(${box.x} ${box.y}) scale(${box.s / 200})`}>
                  <DesignArt slug={design!} inks={inks} />
                </g>
              )}
            </g>
          </g>
        )}

        {/* sombras (se multiplican con la tela y pasan por encima de la tinta) */}
        <g style={{ mixBlendMode: "multiply" }} fill="#000">
          <path d="M60 110 C 50 180, 54 260, 62 330 L 30 330 L 30 110 Z" opacity={sh} filter="url(#bp-soft)" transform="translate(12 0)" />
          <path d="M240 110 C 250 180, 246 260, 238 330 L 270 330 L 270 110 Z" opacity={sh} filter="url(#bp-soft)" transform="translate(-12 0)" />
          <path d="M66 126 C 90 140, 104 160, 112 186" stroke="#000" strokeWidth="7" fill="none" opacity={sh * 0.7} filter="url(#bp-soft-s)" />
          <path d="M234 126 C 210 142, 196 160, 190 184" stroke="#000" strokeWidth="7" fill="none" opacity={sh * 0.7} filter="url(#bp-soft-s)" />
          <path d="M70 142 C 88 156, 96 172, 100 196" stroke="#000" strokeWidth="4" fill="none" opacity={sh * 0.45} filter="url(#bp-soft-s)" />
          <path d="M230 142 C 214 156, 206 172, 204 194" stroke="#000" strokeWidth="4" fill="none" opacity={sh * 0.45} filter="url(#bp-soft-s)" />
          <path d="M118 236 C 124 270, 118 300, 112 332" stroke="#000" strokeWidth="12" fill="none" opacity={sh * 0.55} filter="url(#bp-soft)" />
          <path d="M186 228 C 178 262, 186 300, 196 332" stroke="#000" strokeWidth="10" fill="none" opacity={sh * 0.45} filter="url(#bp-soft)" />
          <path d="M150 262 C 154 290, 150 312, 150 334" stroke="#000" strokeWidth="6" fill="none" opacity={sh * 0.3} filter="url(#bp-soft)" />
          <path d="M60 316 C 120 326, 180 326, 240 316 L 240 334 L 60 334 Z" opacity={sh * 0.8} filter="url(#bp-soft-s)" />
          <path d="M112 30 C 124 48, 176 48, 188 30 L 188 40 C 170 56, 130 56, 112 40 Z" opacity={sh * 0.6} filter="url(#bp-soft-s)" />
          <path d="M30 70 C 40 96, 44 116, 48 146" stroke="#000" strokeWidth="10" fill="none" opacity={sh * 0.5} filter="url(#bp-soft)" />
          <path d="M270 70 C 260 96, 256 116, 252 146" stroke="#000" strokeWidth="10" fill="none" opacity={sh * 0.5} filter="url(#bp-soft)" />
          <path d="M18 104 C 30 114, 42 126, 50 146" stroke="#000" strokeWidth="3" fill="none" opacity={sh * 0.5} filter="url(#bp-soft-s)" />
          <path d="M282 104 C 270 114, 258 126, 250 146" stroke="#000" strokeWidth="3" fill="none" opacity={sh * 0.5} filter="url(#bp-soft-s)" />
        </g>

        {/* brillos */}
        <g style={{ mixBlendMode: "screen" }} fill="#fff">
          <ellipse cx="146" cy="116" rx="62" ry="58" opacity={hl * 0.55} filter="url(#bp-soft-xl)" />
          <path d="M78 136 C 96 150, 108 170, 116 196" stroke="#fff" strokeWidth="5" fill="none" opacity={hl * 0.8} filter="url(#bp-soft-s)" />
          <path d="M222 138 C 206 152, 196 170, 194 194" stroke="#fff" strokeWidth="5" fill="none" opacity={hl * 0.8} filter="url(#bp-soft-s)" />
          <path d="M134 240 C 140 272, 134 304, 130 332" stroke="#fff" strokeWidth="8" fill="none" opacity={hl * 0.6} filter="url(#bp-soft)" />
          <path d="M170 236 C 164 268, 168 300, 176 332" stroke="#fff" strokeWidth="6" fill="none" opacity={hl * 0.45} filter="url(#bp-soft)" />
          <path d="M40 60 C 60 50, 84 44, 104 30" stroke="#fff" strokeWidth="8" fill="none" opacity={hl * 0.55} filter="url(#bp-soft)" />
          <path d="M260 60 C 240 50, 216 44, 196 30" stroke="#fff" strokeWidth="8" fill="none" opacity={hl * 0.4} filter="url(#bp-soft)" />
        </g>

        {/* tejido */}
        <rect width="300" height="340" filter="url(#bp-knit)" style={{ mixBlendMode: "overlay" }} />

        {/* costuras: mangas, hombros y dobladillo */}
        <g fill="none" stroke="#000" strokeOpacity={dark ? 0.5 : 0.22} strokeWidth="0.9" strokeDasharray="2.2 2">
          <path d="M11 121 L 49 136" />
          <path d="M289 121 L 251 136" />
          <path d="M64 318 C 120 324, 180 324, 236 318" />
          <path d="M64 312 C 120 318, 180 318, 236 312" />
        </g>
        <g fill="none" stroke="#000" strokeOpacity={dark ? 0.45 : 0.16} strokeWidth="1.2">
          <path d="M62 124 C 58 96, 52 70, 52 40" />
          <path d="M238 124 C 242 96, 248 70, 248 40" />
        </g>
      </g>

      {/* cuello acanalado */}
      <path d={back ? NECK_BACK : NECK} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path
        d={back ? NECK_BACK : NECK}
        stroke="#000"
        strokeOpacity={dark ? 0.35 : 0.14}
        strokeWidth="9"
        fill="none"
        strokeDasharray="1 1.6"
        strokeLinecap="butt"
      />
      <path d={back ? "M103 23 C 120 31, 180 31, 197 23" : "M103 24 C 118 40, 182 40, 197 24"} stroke="#000" strokeOpacity={dark ? 0.5 : 0.18} strokeWidth="1.4" fill="none" />
    </svg>
  );
}
