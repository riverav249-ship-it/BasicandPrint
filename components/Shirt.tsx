"use client";
import { useId } from "react";
import { DesignArt, inksFor, luminance } from "@/lib/designs";

const BODY =
  "M104 22 C 118 36, 182 36, 196 22 L 252 44 C 262 48, 268 56, 272 66 L 298 132 L 250 152 L 236 120 L 236 318 C 236 326, 230 332, 222 332 L 78 332 C 70 332, 64 326, 64 318 L 64 120 L 50 152 L 2 132 L 28 66 C 32 56, 38 48, 48 44 Z";

type Props = {
  color: string;
  design?: string | null;
  inkKey?: string | number;
  className?: string;
  title?: string;
  animate?: boolean;
};

/** Camiseta vectorial con el diseño impreso en el pecho. */
export default function Shirt({ color, design, inkKey, className, title, animate }: Props) {
  const id = useId().replace(/:/g, "");
  const dark = luminance(color) < 0.2;
  const inks = inksFor(color);
  return (
    <svg viewBox="0 0 300 340" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`sh-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity={dark ? 0.35 : 0.14} />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.4 : 0.16} />
        </linearGradient>
        <linearGradient id={`hl-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.12 : 0.28} />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`cl-${id}`}>
          <path d={BODY} />
        </clipPath>
      </defs>
      <path d={BODY} fill={color} />
      <g clipPath={`url(#cl-${id})`}>
        <rect width="300" height="340" fill={`url(#sh-${id})`} />
        <rect width="300" height="340" fill={`url(#hl-${id})`} />
        <path d="M64 120 C 70 180, 66 260, 72 332" stroke="#000" strokeOpacity={dark ? 0.3 : 0.08} strokeWidth="6" fill="none" />
        <path d="M236 120 C 230 180, 234 260, 228 332" stroke="#000" strokeOpacity={dark ? 0.3 : 0.08} strokeWidth="6" fill="none" />
        <path d="M130 250 C 150 270, 170 300, 164 332" stroke="#000" strokeOpacity={dark ? 0.2 : 0.05} strokeWidth="10" fill="none" />
        {/* costura de mangas */}
        <path d="M50 152 L 2 132 M250 152 L 298 132" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />
        <path d="M58 142 L 12 122 M242 142 L 288 122" stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" strokeDasharray="3 3" />
      </g>
      {/* cuello */}
      <path d="M104 22 C 118 36, 182 36, 196 22 C 190 50, 110 50, 104 22 Z" fill="#000" fillOpacity={dark ? 0.4 : 0.16} />
      <path d="M104 22 C 110 46, 190 46, 196 22" stroke="#000" strokeOpacity={dark ? 0.45 : 0.18} strokeWidth="5" fill="none" />
      {design && (
        <g
          key={`${design}-${inkKey ?? ""}`}
          className={animate ? "ink-pull" : undefined}
          transform="translate(95 80) scale(0.55)"
        >
          <DesignArt slug={design} inks={inks} />
        </g>
      )}
    </svg>
  );
}
