"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/disenar", label: "Diseña tu camisa" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/promociones", label: "Promociones" },
  { href: "/historia", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const path = usePathname();
  const { count, setOpen } = useCart();
  if (path.startsWith("/admin")) return null;
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Basic&Print, inicio">
        <Logo />
      </Link>
      <nav className="main-nav" aria-label="Principal">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="header-tools">
        <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Abrir carrito, ${count} camisetas`}>
          <ShoppingBag aria-hidden="true" />
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
