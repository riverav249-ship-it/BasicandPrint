"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Send, Check, AlertCircle } from "lucide-react";
import Shirt from "./Shirt";
import RegMark from "./RegMark";
import { DesignArt, inksFor } from "@/lib/designs";
import {
  FALLBACK_COLORS,
  FALLBACK_DESIGNS,
  supabase,
  whatsappLink,
  WHATSAPP,
  type Design,
  type ShirtColor,
} from "@/lib/supabase";
import { useTheme } from "./ThemeProvider";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Niño"] as const;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/* ─────────────── Prensa rotativa (colores) ─────────────── */
function Press({
  colors,
  index,
  onIndex,
  design,
  pull,
}: {
  colors: ShirtColor[];
  index: number;
  onIndex: (i: number) => void;
  design: string;
  pull: number;
}) {
  const n = colors.length;
  const step = 360 / n;
  const [rot, setRot] = useState(0);
  const [drag, setDrag] = useState<{ x: number; start: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Mantener la rotación alineada cuando el índice cambia desde fuera
  useEffect(() => {
    if (drag) return;
    setRot((r) => {
      const current = mod(Math.round(r / step), n);
      if (current === index) return r;
      let diff = index - current;
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      return Math.round(r / step) * step + diff * step;
    });
  }, [index, n, step, drag]);

  const go = useCallback(
    (dir: number) => {
      const next = mod(index + dir, n);
      setRot((r) => Math.round(r / step) * step + dir * step);
      onIndex(next);
    },
    [index, n, onIndex, step]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ x: e.clientX, start: rot });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const w = stageRef.current?.clientWidth || 600;
    setRot(drag.start + ((e.clientX - drag.x) / w) * 160 * -1);
  };
  const onPointerUp = () => {
    if (!drag) return;
    const snapped = Math.round(rot / step) * step;
    setRot(snapped);
    setDrag(null);
    onIndex(mod(Math.round(snapped / step), n));
  };

  const active = colors[index];

  return (
    <section className="press" aria-label="Color de camiseta">
      <div
        ref={stageRef}
        className={`press-stage ${drag ? "is-dragging" : ""}`}
        tabIndex={0}
        role="listbox"
        aria-label="Prensa de colores. Usa las flechas para girar."
        aria-activedescendant={`shirt-${active?.slug}`}
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ ["--n" as string]: n }}
      >
        <div className="press-bed" aria-hidden="true">
          <span className="press-hub" />
        </div>
        <div className="press-ring" style={{ transform: `translateZ(calc(var(--r) * -1)) rotateY(${-rot}deg)` }}>
          {colors.map((c, i) => {
            const angle = i * step;
            let dist = Math.abs(mod(angle - rot + 180, 360) - 180);
            dist = Math.min(dist, 180);
            const isFront = i === index && !drag;
            return (
              <div
                key={c.slug}
                id={`shirt-${c.slug}`}
                role="option"
                aria-selected={i === index}
                aria-label={c.name}
                className={`platen ${isFront ? "is-front" : ""}`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(var(--r))`,
                  opacity: 1 - (dist / 180) * 0.72,
                  filter: dist > 60 ? `brightness(${1 - dist / 400})` : undefined,
                }}
                onClick={() => {
                  if (i !== index) {
                    let diff = i - index;
                    if (diff > n / 2) diff -= n;
                    if (diff < -n / 2) diff += n;
                    go(diff);
                  }
                }}
              >
                <Shirt
                  color={c.hex}
                  design={design}
                  inkKey={isFront ? pull : 0}
                  animate={isFront}
                  className="platen-shirt"
                  title={`Camiseta ${c.name}`}
                />
                <span className="platen-arm" aria-hidden="true" />
              </div>
            );
          })}
        </div>
        {/* jalón de rasero sobre la camiseta del frente */}
        <span key={pull} className="squeegee-pass" aria-hidden="true" />
      </div>

      <div className="press-controls">
        <button className="round-btn" onClick={() => go(-1)} aria-label="Color anterior">
          <ChevronLeft aria-hidden="true" />
        </button>
        <p className="press-label" aria-live="polite">
          <span className="ink-dot" style={{ background: active?.hex }} aria-hidden="true" />
          <span className="press-label-name">{active?.name}</span>
          <span className="press-label-count">
            {index + 1}/{n}
          </span>
        </p>
        <button className="round-btn" onClick={() => go(1)} aria-label="Color siguiente">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

/* ─────────────── Carrusel de pantallas (diseños) ─────────────── */
function Screens({
  designs,
  index,
  onIndex,
}: {
  designs: Design[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const n = designs.length;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const [dx, setDx] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frame = w < 380 ? 118 : 138;
  const gap = 14;
  const offset = w / 2 - frame / 2 - index * (frame + gap) + dx;
  const inks = inksFor("#EDEDEA");
  const active = designs[index];

  return (
    <section className="screens" aria-label="Diseño de serigrafía">
      <div className="screens-head">
        <h2 className="panel-label">Diseño</h2>
        <div className="screens-nav">
          <button className="round-btn sm" onClick={() => onIndex(mod(index - 1, n))} aria-label="Diseño anterior">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button className="round-btn sm" onClick={() => onIndex(mod(index + 1, n))} aria-label="Diseño siguiente">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        className="screens-window"
        ref={wrapRef}
        tabIndex={0}
        role="listbox"
        aria-label="Pantallas de diseño. Usa las flechas."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            onIndex(mod(index + 1, n));
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onIndex(mod(index - 1, n));
          }
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, moved: false };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const d = e.clientX - drag.current.x;
          if (Math.abs(d) > 6) drag.current.moved = true;
          setDx(d);
        }}
        onPointerUp={() => {
          if (drag.current?.moved) {
            const shift = Math.round(-dx / (frame + gap));
            if (shift) onIndex(mod(index + shift, n));
          }
          setDx(0);
          window.setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          if (drag.current) {
            setDx(0);
            drag.current = null;
          }
        }}
      >
        <div
          className={`screens-track ${dx ? "is-dragging" : ""}`}
          style={{ transform: `translateX(${offset}px)`, gap, ["--frame" as string]: `${frame}px` }}
        >
          {designs.map((d, i) => (
            <button
              key={d.slug}
              role="option"
              aria-selected={i === index}
              className={`screen-frame ${i === index ? "is-active" : ""}`}
              onClick={() => {
                if (drag.current?.moved) return;
                onIndex(i);
              }}
            >
              <span className="mesh">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <DesignArt slug={d.slug} inks={inks} />
                </svg>
              </span>
              <span className="frame-name">{d.name}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="screen-meta" aria-live="polite">
        <strong>{active?.name}</strong>
        <span>
          {active?.category} · {active?.ink_note}
          {active?.is_sample ? " · diseño de ejemplo" : ""}
        </span>
      </p>
    </section>
  );
}

/* ─────────────── Armador completo ─────────────── */
export default function Builder() {
  const { theme } = useTheme();
  const [colors, setColors] = useState<ShirtColor[]>(FALLBACK_COLORS);
  const [designs, setDesigns] = useState<Design[]>(FALLBACK_DESIGNS);
  const [ci, setCi] = useState(2);
  const [di, setDi] = useState(0);
  const [pull, setPull] = useState(1);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = supabase();
    sb.from("shirt_colors")
      .select("slug,name,hex")
      .order("sort")
      .then(({ data }) => data?.length && setColors(data));
    sb.from("designs")
      .select("slug,name,category,ink_note,is_sample")
      .order("sort")
      .then(({ data }) => data?.length && setDesigns(data));
    // Diseño elegido desde la comunidad (?diseno=slug&color=slug)
    const q = new URLSearchParams(window.location.search);
    const d = q.get("diseno");
    const c = q.get("color");
    if (d) {
      const i = FALLBACK_DESIGNS.findIndex((x) => x.slug === d);
      if (i >= 0) setDi(i);
    }
    if (c) {
      const i = FALLBACK_COLORS.findIndex((x) => x.slug === c);
      if (i >= 0) setCi(i);
    }
  }, []);

  const color = colors[Math.min(ci, colors.length - 1)];
  const design = designs[Math.min(di, designs.length - 1)];

  const pickDesign = (i: number) => {
    setDi(i);
    setPull((p) => p + 1);
  };

  const openSheet = () => {
    setOpen(true);
    requestAnimationFrame(() => sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const summary = `Hola Basic&Print, quiero este pedido:
• Camiseta: ${color.name}
• Diseño: ${design.name}
• Talla: ${size}
• Cantidad: ${qty}${form.notes ? `\n• Notas: ${form.notes}` : ""}
Nombre: ${form.name}
Tel: ${form.phone}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.name.trim().length < 2) return setErr("Escribe tu nombre para saber a quién responder.");
    if (form.phone.replace(/\D/g, "").length < 8) return setErr("Escribe un teléfono de 8 dígitos o más.");
    setStatus("saving");
    const sb = supabase();
    const { data: u } = await sb.auth.getUser();
    const { error } = await sb.from("orders").insert({
      user_id: u.user?.id ?? null,
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      shirt_color: color.slug,
      design_slug: design.slug,
      size,
      quantity: qty,
      notes: form.notes.trim() || null,
      style: theme,
    });
    if (error) {
      setStatus("error");
      setErr("No pudimos guardar el pedido. Igual puedes enviarlo por WhatsApp con el botón de abajo.");
      return;
    }
    setStatus("done");
    window.open(whatsappLink(summary), "_blank", "noopener");
  };

  return (
    <>
      <div className="hero">
        <Press colors={colors} index={Math.min(ci, colors.length - 1)} onIndex={setCi} design={design.slug} pull={pull} />
        <div className="panel">
          <h1 className="hero-title">
            Tu camiseta,
            <br />
            <span>impresa a tu gusto.</span>
          </h1>
          <p className="hero-lede">Gira la prensa para elegir el color, pasa las pantallas para elegir el diseño y pídela por WhatsApp.</p>

          <Screens designs={designs} index={Math.min(di, designs.length - 1)} onIndex={pickDesign} />

          <div className="size-row">
            <h2 className="panel-label" id="talla-l">
              Talla
            </h2>
            <div className="size-tabs" role="radiogroup" aria-labelledby="talla-l">
              {SIZES.map((s) => (
                <button key={s} role="radio" aria-checked={size === s} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="qty-row">
            <h2 className="panel-label" id="cant-l">
              Cantidad
            </h2>
            <div className="stepper" aria-labelledby="cant-l">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">
                <Minus aria-hidden="true" />
              </button>
              <input
                inputMode="numeric"
                value={qty}
                aria-label="Cantidad de camisetas"
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/\D/g, "") || "1", 10);
                  setQty(Math.min(500, Math.max(1, v)));
                }}
              />
              <button onClick={() => setQty((q) => Math.min(500, q + 1))} aria-label="Más">
                <Plus aria-hidden="true" />
              </button>
            </div>
            {qty >= 12 && <p className="qty-hint">Pedido de grupo: te cotizamos precio especial.</p>}
          </div>

          <button className="squeegee" onClick={openSheet}>
            <span>Imprimir y pedir</span>
          </button>
        </div>
      </div>

      <div ref={sheetRef} className={`order-sheet ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {open && (
          <form onSubmit={submit} className="sheet-inner" noValidate>
            <RegMark className="corner tl" />
            <RegMark className="corner tr" />
            <RegMark className="corner bl" />
            <RegMark className="corner br" />
            <div className="sheet-preview">
              <Shirt color={color.hex} design={design.slug} className="sheet-shirt" title="Tu camiseta" />
            </div>
            <div className="sheet-body">
              <h2>Hoja de orden</h2>
              <dl className="sheet-summary">
                <div>
                  <dt>Camiseta</dt>
                  <dd>{color.name}</dd>
                </div>
                <div>
                  <dt>Diseño</dt>
                  <dd>{design.name}</dd>
                </div>
                <div>
                  <dt>Talla</dt>
                  <dd>{size}</dd>
                </div>
                <div>
                  <dt>Cantidad</dt>
                  <dd>{qty}</dd>
                </div>
              </dl>
              <label>
                Tu nombre
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
              </label>
              <label>
                Teléfono / WhatsApp
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="7000 0000"
                  required
                />
              </label>
              <label>
                Notas (opcional)
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  maxLength={500}
                  rows={3}
                  placeholder="Ej.: nombres en la espalda, fecha que lo necesitas, tallas mezcladas…"
                />
              </label>
              <p className="price-note">Te confirmamos precio y tiempo de entrega por WhatsApp.</p>
              {err && (
                <p className="form-error" role="alert">
                  <AlertCircle aria-hidden="true" /> {err}
                </p>
              )}
              {status === "done" ? (
                <div className="form-ok" role="status">
                  <Check aria-hidden="true" />
                  <p>
                    Pedido guardado. Si WhatsApp no se abrió,{" "}
                    <a href={whatsappLink(summary)} target="_blank" rel="noopener noreferrer">
                      ábrelo aquí
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <button type="submit" className="squeegee" disabled={status === "saving"}>
                  <span>
                    <Send aria-hidden="true" />
                    {status === "saving" ? "Guardando…" : "Enviar pedido por WhatsApp"}
                  </span>
                </button>
              )}
              {status === "error" && (
                <a className="text-link" href={whatsappLink(summary)} target="_blank" rel="noopener noreferrer">
                  Enviar por WhatsApp sin guardar
                </a>
              )}
              {!WHATSAPP && <p className="dev-note">Falta configurar el número de WhatsApp del negocio.</p>}
            </div>
          </form>
        )}
      </div>
    </>
  );
}
