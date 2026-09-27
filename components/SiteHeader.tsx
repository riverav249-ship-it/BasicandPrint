"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RegMark from "./RegMark";
import { THEMES, useTheme } from "./ThemeProvider";

const NAV = [
  { href: "/", label: "Imprimir" },
  { href: "/historia", label: "Nosotros" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/promociones", label: "Promos y rachas" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const path = usePathname();
  const { theme, setTheme } = useTheme();
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Basic&Print, inicio">
        <RegMark />
        <span>
          Basic<em>&amp;</em>Print
        </span>
      </Link>
      <nav className="main-nav" aria-label="Principal">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="style-switch" role="radiogroup" aria-label="Estilo de la página">
        {THEMES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={theme === t.id}
            className={`swatch swatch-${t.id}`}
            onClick={() => setTheme(t.id)}
            title={t.hint}
          >
            <span className="chip" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}
