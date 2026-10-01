"use client";
import Link from "next/link";
import { useState } from "react";
import ShirtDeck from "@/components/ShirtDeck";
import { useShirtColors } from "@/lib/useCatalog";

/** Portada: abanico de camisetas reales que gira solo. */
export default function HeroCarousel() {
  const colors = useShirtColors();
  const [active, setActive] = useState(0);
  const current = colors[Math.min(active, colors.length - 1)];

  return (
    <ShirtDeck colors={colors} index={active} onIndex={setActive} autoplay label="Colores de camiseta disponibles">
      <Link className="deck-link" href={`/disenar?color=${current?.slug ?? ""}`}>
        Diseñar en {current?.name.toLowerCase()}
      </Link>
      <p className="deck-note" aria-hidden="true">
        Sin límites
        <br />
        para tu
        <br />
        creatividad
        <svg viewBox="0 0 60 50" className="deck-arrow">
          <path d="M50 4 C 52 26, 36 40, 10 44 M10 44 L 20 34 M10 44 L 22 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </p>
    </ShirtDeck>
  );
}
