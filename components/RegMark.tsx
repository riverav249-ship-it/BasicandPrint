/* Marca del estudio: la tornamesa vista desde arriba (aro, marcas de giro y punto de luz). */
export default function RegMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`regmark ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path
        d="M12 0.8v2.6M12 20.6v2.6M0.8 12h2.6M20.6 12h2.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="5.5" r="1.6" className="regmark-dot" fill="currentColor" />
    </svg>
  );
}
