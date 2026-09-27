export default function RegMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`regmark ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 1v22M1 12h22" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
