"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Upload, X, Check, AlertCircle, ShoppingBag } from "lucide-react";
import { type Placement } from "./Shirt";
import ShirtDeck from "./ShirtDeck";
import { DesignArt, inksFor } from "@/lib/designs";
import { FALLBACK_COLORS, FALLBACK_DESIGNS, supabase, type Design, type ShirtColor } from "@/lib/supabase";
import { useCart } from "@/lib/cart";
import { BASIC_SLUG, money, unitPrice } from "@/lib/pricing";
import { usePrices } from "@/lib/usePrices";

const BASIC_DESIGN: Design = { slug: BASIC_SLUG, name: "Sin estampado", category: "Básicas", ink_note: null, is_sample: false };

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Niño"] as const;
const PLACEMENTS: { id: Placement; label: string }[] = [
  { id: "frente", label: "Frente" },
  { id: "pecho", label: "Pecho" },
  { id: "espalda", label: "Espalda" },
];
const mod = (n: number, m: number) => ((n % m) + m) % m;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

type Print = { design: string; designImage?: string | null; logoUrl?: string | null; placement: Placement };

/* ─────────────── Carrusel de pantallas (diseños) ─────────────── */
function Screens({
  designs,
  index,
  onIndex,
  logoPreview,
}: {
  designs: Design[];
  index: number;
  onIndex: (i: number) => void;
  logoPreview: string | null;
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

  const frame = w < 380 ? 78 : 86;
  const gap = 12;
  const offset = w / 2 - frame / 2 - index * (frame + gap) + dx;
  const inks = inksFor("#EDEDEA");

  return (
    <div className="screens">
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
          {designs.map((d, i) => {
            const isLogo = d.slug === "tu-logo";
            const img = isLogo ? logoPreview : d.image_url;
            return (
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
                  {d.slug === BASIC_SLUG ? (
                    <span className="mesh-plain">Lisa</span>
                  ) : img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" draggable={false} />
                  ) : (
                    <svg viewBox="0 0 200 200" aria-hidden="true">
                      <DesignArt slug={d.slug} inks={inks} />
                    </svg>
                  )}
                </span>
                <span className="frame-name">{isLogo && logoPreview ? "Mi logo" : d.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Armador completo ─────────────── */
export default function Builder() {
  const { add, setOpen } = useCart();
  const [colors, setColors] = useState<ShirtColor[]>(FALLBACK_COLORS);
  const [designs, setDesigns] = useState<Design[]>([...FALLBACK_DESIGNS, BASIC_DESIGN]);
  const prices = usePrices();
  const [stock, setStock] = useState<Record<string, Record<string, number>>>({});
  const [ci, setCi] = useState(0);
  const [di, setDi] = useState(0);
  const [pull, setPull] = useState(1);
  const [placement, setPlacement] = useState<Placement>("frente");
  const [counts, setCounts] = useState<Record<string, number>>({ M: 1 });
  const [logo, setLogo] = useState<{ preview: string; url: string | null; name: string } | null>(null);
  const [logoState, setLogoState] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [logoErr, setLogoErr] = useState("");
  const [added, setAdded] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sb = supabase();
    sb.from("shirt_colors")
      .select("slug,name,hex,image_url")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => data?.length && setColors(data));
    sb.from("designs")
      .select("slug,name,category,ink_note,is_sample,image_url")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => {
        if (!data?.length) return;
        // "Tu logo aquí" siempre disponible como pantalla para subir el propio logo
        const hasLogo = data.some((d) => d.slug === "tu-logo");
        setDesigns([...(hasLogo ? data : [...data, FALLBACK_DESIGNS.find((d) => d.slug === "tu-logo")!]), BASIC_DESIGN]);
      });
    sb.from("inventory")
      .select("color_slug,size,stock")
      .then(({ data }) => {
        const map: Record<string, Record<string, number>> = {};
        (data ?? []).forEach((r) => ((map[r.color_slug] ??= {})[r.size] = r.stock));
        setStock(map);
      });
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
  const isLogo = design.slug === "tu-logo";
  const isBasic = design.slug === BASIC_SLUG;
  const colorStock = stock[color.slug];
  const available = (s: string) => (colorStock && s in colorStock ? colorStock[s] : Infinity);

  // Ajustar cantidades si el color elegido tiene menos existencias
  useEffect(() => {
    setCounts((c) => {
      const next: Record<string, number> = {};
      for (const [s, q] of Object.entries(c)) {
        const cap = available(s);
        if (cap > 0) next[s] = Math.min(q, cap);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color.slug, stock]);

  const print: Print = {
    design: isBasic ? "" : design.slug,
    designImage: isLogo ? null : design.image_url,
    logoUrl: isLogo ? logo?.url ?? logo?.preview ?? null : null,
    placement,
  };

  const pickDesign = (i: number) => {
    setDi(i);
    setPull((p) => p + 1);
  };

  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const bump = (s: string, d: number) =>
    setCounts((c) => {
      const v = Math.max(0, Math.min(available(s), 500, (c[s] ?? 0) + d));
      const next = { ...c, [s]: v };
      if (!v) delete next[s];
      return next;
    });

  const onFile = async (file?: File | null) => {
    setLogoErr("");
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setLogoState("error");
      setLogoErr("Sube una imagen PNG, JPG, SVG o WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoState("error");
      setLogoErr("La imagen pesa más de 5 MB. Prueba con una versión más liviana.");
      return;
    }
    const preview = URL.createObjectURL(file);
    setLogo({ preview, url: null, name: file.name });
    setLogoState("uploading");
    const logoIdx = designs.findIndex((d) => d.slug === "tu-logo");
    if (logoIdx >= 0) pickDesign(logoIdx);
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const sb = supabase();
    const { error } = await sb.storage.from("logos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setLogoState("error");
      setLogoErr("No se pudo subir el logo. Revisa tu conexión e inténtalo otra vez.");
      return;
    }
    const url = sb.storage.from("logos").getPublicUrl(path).data.publicUrl;
    setLogo({ preview, url, name: file.name });
    setLogoState("ready");
    setPull((p) => p + 1);
  };

  const addToCart = () => {
    if (!total) return;
    if (isLogo && !logo?.url) {
      setLogoErr(logoState === "uploading" ? "Espera a que termine de subir tu logo." : "Sube tu logo antes de agregar.");
      return;
    }
    add(
      Object.entries(counts).map(([size, qty]) => ({
        colorSlug: color.slug,
        colorName: color.name,
        hex: color.hex,
        designSlug: design.slug,
        designName: isBasic ? "Básica sin estampado" : `${design.name}${placement !== "frente" ? ` (${placement})` : ""}`,
        logoUrl: isLogo ? logo?.url : null,
        printed: !isBasic,
        size,
        qty,
      }))
    );
    setAdded(total);
  };

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(0), 4000);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <div className="hero">
      <section className="builder-deck" aria-label="Color de camiseta">
        <ShirtDeck
          colors={colors}
          index={Math.min(ci, colors.length - 1)}
          onIndex={setCi}
          print={{ design: print.design, designImage: print.designImage, logoUrl: print.logoUrl, placement: print.placement }}
          inkKey={pull}
          label="Elige el color de tu camiseta"
        />
      </section>
      <div className="panel">
        <h1 className="hero-title">
          Tu camiseta,
          <br />
          <span>impresa a tu gusto.</span>
        </h1>

        <Screens designs={designs} index={Math.min(di, designs.length - 1)} onIndex={pickDesign} logoPreview={logo?.preview ?? null} />

        <div
          className={`logo-drop ${isLogo ? "is-focus" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept={LOGO_TYPES.join(",")}
            className="sr-only"
            id="logo-file"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {logo ? (
            <p className="logo-status">
              {logoState === "uploading" && <span className="spinner" aria-hidden="true" />}
              {logoState === "ready" && <Check aria-hidden="true" />}
              <span>
                {logoState === "uploading" ? "Subiendo " : ""}
                <strong>{logo.name}</strong>
              </span>
              <button
                className="icon-btn"
                aria-label="Quitar logo"
                onClick={() => {
                  setLogo(null);
                  setLogoState("idle");
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                <X aria-hidden="true" />
              </button>
            </p>
          ) : (
            <label htmlFor="logo-file" className="logo-btn">
              <Upload aria-hidden="true" />
              <span>
                <strong>Sube tu propio logo</strong> PNG, JPG o SVG hasta 5 MB. Mejor con fondo transparente.
              </span>
            </label>
          )}
          {logoErr && (
            <p className="form-error" role="alert">
              <AlertCircle aria-hidden="true" /> {logoErr}
            </p>
          )}
        </div>

        <div className="place-row">
          <h2 className="panel-label" id="lugar-l">
            Dónde va
          </h2>
          <div className="seg-mini" role="radiogroup" aria-labelledby="lugar-l">
            {PLACEMENTS.map((p) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={placement === p.id}
                onClick={() => {
                  setPlacement(p.id);
                  setPull((x) => x + 1);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="size-grid-wrap">
          <h2 className="panel-label" id="talla-l">
            Tallas y cantidades <span className="label-note">puedes mezclar tallas</span>
          </h2>
          <ul className="size-grid" aria-labelledby="talla-l">
            {SIZES.map((s) => {
              const cap = available(s);
              const q = counts[s] ?? 0;
              const out = cap <= 0;
              return (
                <li key={s} className={`${q ? "has-qty" : ""} ${out ? "is-out" : ""}`}>
                  <span className="size-name">{s}</span>
                  {out ? (
                    <span className="size-out">Agotada</span>
                  ) : (
                    <span className="size-step">
                      <button onClick={() => bump(s, -1)} disabled={!q} aria-label={`Una menos talla ${s}`}>
                        <Minus aria-hidden="true" />
                      </button>
                      <span className="size-qty" aria-live="polite" aria-label={`${q} talla ${s}`}>
                        {q}
                      </span>
                      <button onClick={() => bump(s, 1)} disabled={q >= cap} aria-label={`Una más talla ${s}`}>
                        <Plus aria-hidden="true" />
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {total > 0 && (
            <p className="qty-hint" aria-live="polite">
              {total} × {money(unitPrice(!isBasic, total, prices))} = <strong>{money(total * unitPrice(!isBasic, total, prices))}</strong>
              {total < prices.packMin
                ? ` · desde ${prices.packMin} pagas ${money(isBasic ? prices.basicPack : prices.printPack)} c/u`
                : " · precio de paquete"}
            </p>
          )}
        </div>

        <div className="add-row">
          <button className="squeegee" onClick={addToCart} disabled={!total}>
            <span>
              <ShoppingBag aria-hidden="true" />
              {total ? `Agregar ${total} al carrito` : "Elige al menos una talla"}
            </span>
          </button>
          {added > 0 && (
            <p className="added-note" role="status">
              <Check aria-hidden="true" /> {added} en el carrito.{" "}
              <button className="text-link" onClick={() => setOpen(true)}>
                Ver carrito
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
