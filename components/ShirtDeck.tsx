"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Shirt, { type Placement } from "@/components/Shirt";
import { luminance } from "@/lib/designs";
import type { ShirtColor } from "@/lib/constants";

const VISIBLE = 5; // camisetas visibles en el abanico
const EVERY = 3200; // ms entre giros automáticos

export type DeckPrint = {
  design?: string | null;
  designImage?: string | null;
  logoUrl?: string | null;
  placement?: Placement;
  art?: React.ReactNode;
};

/**
 * Abanico de camisetas reales. La del frente lleva el estampado.
 * - autoplay: gira solo (portada); se pausa mientras el cliente interactúa.
 * - index/onIndex: control externo (armador).
 */
export default function ShirtDeck({
  colors,
  index,
  onIndex,
  print,
  inkKey,
  autoplay = false,
  label = "Colores de camiseta",
  children,
}: {
  colors: ShirtColor[];
  index?: number;
  onIndex?: (i: number) => void;
  print?: DeckPrint;
  inkKey?: string | number;
  autoplay?: boolean;
  label?: string;
  children?: React.ReactNode;
}) {
  const n = colors.length;
  const [own, setOwn] = useState(0);
  const active = Math.min(index ?? own, n - 1);
  const setActive = useCallback((i: number) => (onIndex ? onIndex(i) : setOwn(i)), [onIndex]);
  const [playing, setPlaying] = useState(autoplay);
  const [hold, setHold] = useState(false);
  const swipe = useRef<number | null>(null);

  const go = useCallback((d: number) => setActive((((active + d) % n) + n) % n), [active, n, setActive]);

  useEffect(() => {
    if (!autoplay || !playing || hold || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => go(1), EVERY);
    return () => window.clearTimeout(t);
  }, [autoplay, playing, hold, n, go]);

  const current = colors[active];
  const front = print ?? { design: "tu-diseno-aqui" };

  return (
    <div
      className="deck"
      data-stage={current && luminance(current.hex) < 0.12 ? "claro" : "oscuro"}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <div
        className="deck-stage"
        role="group"
        aria-roledescription="carrusel"
        aria-label={label}
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
          const isFront = k === 0;
          return (
            <button
              type="button"
              key={c.slug}
              className="deck-card"
              data-pos={hidden ? "off" : k}
              style={{ zIndex: n - k }}
              aria-label={isFront ? `Camiseta ${c.name}, al frente` : `Ver camiseta ${c.name}`}
              aria-hidden={hidden || undefined}
              tabIndex={hidden || isFront ? -1 : 0}
              onClick={() => !isFront && setActive(i)}
            >
              <Shirt
                color={c.hex}
                photo={c.image_url}
                design={isFront ? front.design : null}
                designImage={isFront ? front.designImage : null}
                logoUrl={isFront ? front.logoUrl : null}
                art={isFront ? front.art : undefined}
                placement={isFront ? front.placement : "frente"}
                inkKey={isFront ? inkKey : undefined}
                animate={isFront && inkKey !== undefined}
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
          <span className="deck-count">
            {active + 1}/{n}
          </span>
        </p>
        <button type="button" className="deck-btn" onClick={() => go(1)} aria-label="Color siguiente">
          <ChevronRight aria-hidden="true" />
        </button>
        {autoplay && (
          <button
            type="button"
            className="deck-btn ghost"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pausar el carrusel" : "Reanudar el carrusel"}
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
