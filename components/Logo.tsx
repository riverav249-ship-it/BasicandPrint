/** Marca: camiseta de contorno + nombre + línea de servicio. */
export function TeeMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="tee-mark">
      <path
        d="M14 6 C 16 9, 24 9, 26 6 L 34 10 L 38 18 L 32 21 L 30 17 L 30 35 L 10 35 L 10 17 L 8 21 L 2 18 L 6 10 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M15 7.5 C 17 11, 23 11, 25 7.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "brand-sm" : ""}`}>
      <TeeMark size={small ? 28 : 36} />
      <span className="brand-text">
        <span className="brand-name">
          Basic<em>&amp;</em>Print
        </span>
        <span className="brand-line">Serigrafía personalizada</span>
      </span>
    </span>
  );
}
