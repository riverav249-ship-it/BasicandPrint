"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import RegMark from "./RegMark";
import { THEMES, useTheme } from "./ThemeProvider";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/", label: "Configurar" },
  { href: "/historia", label: "Nosotros" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/promociones", label: "Promos y rachas" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const path = usePathname();
  const { theme, setTheme } = useTheme();
  const { count, setOpen } = useCart();
  if (path.startsWith("/admin")) return null;
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
      <div className="header-tools">
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
        <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Abrir pedido, ${count} camisetas`}>
          <ShoppingBag aria-hidden="true" />
          <span className="cart-label">Pedido</span>
          {count > 0 && (
            <span key={count} className="cart-count">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
