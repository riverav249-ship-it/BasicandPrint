"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Shirt from "@/components/Shirt";
import { useShirtColors } from "@/lib/useCatalog";

const VISIBLE = 5; // camisetas visibles en el abanico
const EVERY = 3200; // ms entre giros automáticos

/** Abanico de camisetas reales del catálogo: la del frente lleva el estampado y rota sola. */
export default function HeroCarousel() {
  const colors = useShirtColors();
  const n = colors.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false); // pausa temporal mientras el cliente interactúa
  const swipe = useRef<number | null>(null);

  const go = useCallback((d: number) => setActive((a) => (((a + d) % n) + n) % n), [n]);

  useEffect(() => {
    if (!playing || hold || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => go(1), EVERY);
    return () => window.clearInterval(t);
  }, [playing, hold, n, go]);

  const current = colors[Math.min(active, n - 1)];

  return (
    <div
      className="deck"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <div
        className="deck-stage"
        role="group"
        aria-roledescription="carrusel"
        aria-label="Colores de camiseta disponibles"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        onPointerDown={(e) => (swipe.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipe.current === null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {colors.map((c, i) => {
          const k = (((i - active) % n) + n) % n; // 0 = frente
          const hidden = k >= VISIBLE;
          return (
            <button
              type="button"
              key={c.slug}
              className="deck-card"
              data-pos={hidden ? "off" : k}
              style={{ zIndex: n - k }}
              aria-label={k === 0 ? `Camiseta ${c.name}, al frente` : `Ver camiseta ${c.name}`}
              aria-hidden={hidden || undefined}
              tabIndex={hidden || k === 0 ? -1 : 0}
              onClick={() => k && setActive(i)}
            >
              <Shirt
                color={c.hex}
                photo={c.image_url}
                design={k === 0 ? "tu-diseno-aqui" : null}
                className="deck-shirt"
                title={`Camiseta ${c.name}`}
              />
            </button>
          );
        })}
      </div>

      <div className="deck-controls">
        <button type="button" className="deck-btn" onClick={() => go(-1)} aria-label="Color anterior">
          <ChevronLeft aria-hidden="true" />
        </button>
        <p className="deck-name" aria-live="polite">
          <span className="deck-dot" style={{ background: current?.hex }} aria-hidden="true" />
          {current?.name}
        </p>
        <button type="button" className="deck-btn" onClick={() => go(1)} aria-label="Color siguiente">
          <ChevronRight aria-hidden="true" />
        </button>
        <button
          type="button"
          className="deck-btn ghost"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pausar el carrusel" : "Reanudar el carrusel"}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
      </div>
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
    </div>
  );
}
