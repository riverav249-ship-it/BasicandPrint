"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  AlertCircle,
  Minus,
  Plus,
  RotateCcw,
  Shirt as ShirtIcon,
  Sparkles,
  Type,
  Upload,
  Ruler,
  Trash2,
  ShoppingBag,
  Palette,
} from "lucide-react";
import Shirt, { type ShirtView } from "./Shirt";
import { DesignArt, inksFor, luminance } from "@/lib/designs";
import { FALLBACK_COLORS, FALLBACK_DESIGNS, supabase, type Design, type ShirtColor } from "@/lib/supabase";
import { useCart } from "@/lib/cart";

/* ─────────────── tipos y utilidades ─────────────── */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Niño"] as const;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const TEXT_MAX = 16;

type Font = "deportiva" | "elegante" | "divertida";
const FONTS: { id: Font; label: string }[] = [
  { id: "deportiva", label: "Deportiva" },
  { id: "elegante", label: "Elegante" },
  { id: "divertida", label: "Divertida" },
];
const TEXT_INKS = [
  { hex: "#FFFFFF", name: "Blanco" },
  { hex: "#141414", name: "Negro" },
  { hex: "#D8452B", name: "Rojo" },
  { hex: "#F2C230", name: "Amarillo" },
  { hex: "#0E8C8A", name: "Turquesa" },
  { hex: "#2450B8", name: "Azul" },
];

type DesignLayer = { slug: string; name: string; image?: string | null; logo?: boolean; x: number; y: number; s: number };
type TextLayer = { value: string; font: Font; ink: string; x: number; y: number; s: number };
type Side = { design: DesignLayer | null; text: TextLayer | null };
type Tool = "color" | "diseno" | "texto" | "tallas";
type Sel = "design" | "text" | null;

const TOOLS: { id: Tool; label: string; Icon: typeof Palette }[] = [
  { id: "color", label: "Color", Icon: Palette },
  { id: "diseno", label: "Diseño", Icon: Sparkles },
  { id: "texto", label: "Texto", Icon: Type },
  { id: "tallas", label: "Tallas", Icon: Ruler },
];

const BOUNDS = { x0: 84, x1: 216, y0: 62, y1: 292 };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v * t + pb[i] * (1 - t)).toString(16).padStart(2, "0")).join("")}`;
};
/** Fondo del escenario: un tono claro del color de la camiseta, para que ella resalte. */
const stageTint = (hex: string) => (luminance(hex) > 0.6 ? "#d7d8d4" : mixHex(hex.toLowerCase(), "#f4f4f1", 0.3));
/** Color de interfaz derivado de la camiseta (botones y acentos de todo el sitio). */
const uiInk = (hex: string) => (luminance(hex) > 0.6 ? "#141414" : hex);

const fontStyle = (f: Font): React.CSSProperties =>
  f === "deportiva"
    ? { fontFamily: "Archivo Variable, sans-serif", fontWeight: 900, fontStyle: "italic", fontStretch: "125%", textTransform: "uppercase", letterSpacing: "-0.01em" }
    : f === "elegante"
      ? { fontFamily: "Archivo Variable, sans-serif", fontWeight: 300, fontStretch: "125%", textTransform: "uppercase", letterSpacing: "0.22em" }
      : { fontFamily: "Bungee, sans-serif", fontWeight: 400, textTransform: "uppercase" };
const textWidth = (t: TextLayer) => Math.max(1, t.value.length) * t.s * (t.font === "elegante" ? 0.95 : t.font === "divertida" ? 0.78 : 0.74);

const emptySide = (): Side => ({ design: null, text: null });

/* ─────────────── capas sobre la camiseta ─────────────── */
function ArtLayer({ layer, inks, stampKey }: { layer: DesignLayer; inks: ReturnType<typeof inksFor>; stampKey: number }) {
  const h = layer.s / 2;
  return (
    <g transform={`translate(${layer.x} ${layer.y})`}>
      <g key={stampKey} className="stamp">
        <g filter="url(#bp-print)">
          {layer.image ? (
            <image href={layer.image} x={-h} y={-h} width={layer.s} height={layer.s} preserveAspectRatio="xMidYMid meet" />
          ) : (
            <g transform={`translate(${-h} ${-h}) scale(${layer.s / 200})`}>
              <DesignArt slug={layer.slug} inks={inks} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
}

function WordLayer({ layer, stampKey }: { layer: TextLayer; stampKey: number }) {
  return (
    <g transform={`translate(${layer.x} ${layer.y})`}>
      <g key={stampKey} className="stamp">
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={layer.s}
          fill={layer.ink}
          filter="url(#bp-print)"
          style={fontStyle(layer.font)}
        >
          {layer.value}
        </text>
      </g>
    </g>
  );
}

/** Salpicadura de tinta al estampar: una sola vez por estampado. */
function Splash({ x, y, color, k }: { x: number; y: number; color: string; k: number }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + (k % 5) * 0.4;
        const d = 34 + ((i * 37 + k * 13) % 26);
        return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, r: 2 + ((i + k) % 3) };
      }),
    [k]
  );
  return (
    <g key={k} className="splash" transform={`translate(${x} ${y})`} pointerEvents="none">
      {drops.map((d, i) => (
        <circle key={i} r={d.r} fill={color} style={{ ["--dx" as string]: `${d.dx}px`, ["--dy" as string]: `${d.dy}px` }} />
      ))}
    </g>
  );
}

/* ─────────────── taller completo ─────────────── */
export default function Studio() {
  const { add, setOpen, count } = useCart();
  const [colors, setColors] = useState<ShirtColor[]>(FALLBACK_COLORS);
  const [designs, setDesigns] = useState<Design[]>(FALLBACK_DESIGNS);
  const [stock, setStock] = useState<Record<string, Record<string, number>>>({});
  const [ci, setCi] = useState(4);
  const [tool, setTool] = useState<Tool>("color");
  const [view, setView] = useState<ShirtView>("front");
  const [sides, setSides] = useState<Record<ShirtView, Side>>({
    front: { design: { slug: "torogoz", name: "Torogoz", x: 150, y: 150, s: 112 }, text: null },
    back: emptySide(),
  });
  const [sel, setSel] = useState<Sel>(null);
  const [stamp, setStamp] = useState(1);
  const [splash, setSplash] = useState<{ x: number; y: number; k: number } | null>(null);
  const [floods, setFloods] = useState<{ k: number; tint: string; fx: string; fy: string }[]>([]);
  const [category, setCategory] = useState("Todos");
  const [counts, setCounts] = useState<Record<string, number>>({ M: 1 });
  const [logo, setLogo] = useState<{ preview: string; url: string | null; name: string } | null>(null);
  const [logoState, setLogoState] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [printing, setPrinting] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const firstTool = useRef(true);
  const drag = useRef<{ what: Sel | "resize"; ox: number; oy: number; s0: number; d0: number } | null>(null);

  /* datos reales */
  useEffect(() => {
    const sb = supabase();
    sb.from("shirt_colors")
      .select("slug,name,hex")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => data?.length && setColors(data));
    sb.from("designs")
      .select("slug,name,category,ink_note,is_sample,image_url")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => {
        if (!data?.length) return;
        setDesigns(data.filter((d) => d.slug !== "tu-logo"));
      });
    sb.from("inventory")
      .select("color_slug,size,stock")
      .then(({ data }) => {
        const map: Record<string, Record<string, number>> = {};
        (data ?? []).forEach((r) => ((map[r.color_slug] ??= {})[r.size] = r.stock));
        setStock(map);
      });
  }, []);

  /* enlaces ?diseno=slug&color=slug */
  const wanted = useRef<{ d: string | null; c: string | null } | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    wanted.current = { d: q.get("diseno"), c: q.get("color") };
  }, []);
  useEffect(() => {
    const w = wanted.current;
    if (!w) return;
    if (w.c) {
      const i = colors.findIndex((x) => x.slug === w.c);
      if (i >= 0) setCi(i);
    }
    if (w.d) {
      const d = designs.find((x) => x.slug === w.d);
      if (d)
        setSides((s) => ({ ...s, front: { ...s.front, design: { slug: d.slug, name: d.name, image: d.image_url, x: 150, y: 150, s: 112 } } }));
    }
  }, [colors, designs]);

  const color = colors[Math.min(ci, colors.length - 1)];
  const side = sides[view];
  const inks = inksFor(color.hex);

  /* la página toma el color de la camiseta */
  useEffect(() => {
    const ink = uiInk(color.hex);
    const root = document.documentElement;
    root.style.setProperty("--ink", ink);
    root.style.setProperty("--ink-fg", luminance(ink) > 0.35 ? "#141414" : "#ffffff");
  }, [color.hex]);

  /* primera inundación al cargar */
  useEffect(() => {
    setFloods([{ k: 0, tint: stageTint(color.hex), fx: "50%", fy: "55%" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickColor = (i: number, e?: React.MouseEvent) => {
    if (i === ci) return;
    setCi(i);
    const st = stageRef.current?.getBoundingClientRect();
    let fx = "50%",
      fy = "55%";
    if (e && st && window.innerWidth > 980) {
      // la tinta entra desde el costado donde está la paleta
      fx = "100%";
      fy = `${clamp(((e.clientY - st.top) / st.height) * 100, 0, 100)}%`;
    }
    setFloods((f) => [...f.slice(-1), { k: (f.at(-1)?.k ?? 0) + 1, tint: stageTint(colors[i].hex), fx, fy }]);
  };

  /* existencias */
  const colorStock = stock[color.slug];
  const available = useCallback((s: string) => (colorStock && s in colorStock ? colorStock[s] : Infinity), [colorStock]);
  useEffect(() => {
    setCounts((c) => {
      const next: Record<string, number> = {};
      for (const [s, q] of Object.entries(c)) {
        const cap = available(s);
        if (cap > 0) next[s] = Math.min(q, cap);
      }
      return next;
    });
  }, [available]);
  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const bump = (s: string, d: number) =>
    setCounts((c) => {
      const v = Math.max(0, Math.min(available(s), 500, (c[s] ?? 0) + d));
      const next = { ...c, [s]: v };
      if (!v) delete next[s];
      return next;
    });

  /* capas */
  const setSide = (patch: Partial<Side>) => setSides((s) => ({ ...s, [view]: { ...s[view], ...patch } }));
  const boom = (x: number, y: number) => {
    setStamp((k) => k + 1);
    setSplash((p) => ({ x, y, k: (p?.k ?? 0) + 1 }));
  };
  const placeDesign = (d: { slug: string; name: string; image?: string | null; logo?: boolean }) => {
    const cur = side.design;
    const layer: DesignLayer = { ...d, x: cur?.x ?? 150, y: cur?.y ?? (view === "back" ? 150 : 150), s: cur?.s ?? (view === "back" ? 130 : 112) };
    setSide({ design: layer });
    setSel("design");
    boom(layer.x, layer.y);
  };
  const setText = (patch: Partial<TextLayer>) => {
    const cur = side.text ?? { value: "", font: "deportiva" as Font, ink: luminance(color.hex) > 0.35 ? "#141414" : "#FFFFFF", x: 150, y: view === "back" ? 96 : 250, s: 30 };
    const next = { ...cur, ...patch };
    // El texto nunca se sale del área de impresión: se achica solo si es muy largo.
    const fit = 132 / (Math.max(1, next.value.length) * (textWidth({ ...next, value: "x", s: 1 }) || 1));
    next.s = Math.min(next.s, Math.max(12, fit));
    setSide({ text: next });
    setSel("text");
  };

  const toSvg = (e: React.PointerEvent) => {
    const svg = (e.target as SVGElement).ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const startDrag = (what: Sel | "resize") => (e: React.PointerEvent) => {
    e.stopPropagation();
    const target = what === "resize" ? sel : what;
    const layer = target === "design" ? side.design : target === "text" ? side.text : null;
    if (!layer) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const p = toSvg(e);
    if (what !== "resize") setSel(what);
    drag.current = { what, ox: p.x - layer.x, oy: p.y - layer.y, s0: layer.s, d0: Math.hypot(p.x - layer.x, p.y - layer.y) };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toSvg(e);
    const target = d.what === "resize" ? sel : d.what;
    if (d.what === "resize") {
      const f = Math.hypot(p.x - (side[target === "design" ? "design" : "text"]!.x), p.y - side[target === "design" ? "design" : "text"]!.y) / (d.d0 || 1);
      if (target === "design" && side.design) setSide({ design: { ...side.design, s: clamp(d.s0 * f, 30, 150) } });
      if (target === "text" && side.text) setSide({ text: { ...side.text, s: clamp(d.s0 * f, 12, 60) } });
      return;
    }
    const x = clamp(p.x - d.ox, BOUNDS.x0, BOUNDS.x1);
    const y = clamp(p.y - d.oy, BOUNDS.y0, BOUNDS.y1);
    if (target === "design" && side.design) setSide({ design: { ...side.design, x, y } });
    if (target === "text" && side.text) setSide({ text: { ...side.text, x, y } });
  };
  const endDrag = () => (drag.current = null);

  const nudge = (dx: number, dy: number, ds = 0) => {
    if (sel === "design" && side.design) {
      const l = side.design;
      setSide({ design: { ...l, x: clamp(l.x + dx, BOUNDS.x0, BOUNDS.x1), y: clamp(l.y + dy, BOUNDS.y0, BOUNDS.y1), s: clamp(l.s + ds, 30, 150) } });
    }
    if (sel === "text" && side.text) {
      const l = side.text;
      setSide({ text: { ...l, x: clamp(l.x + dx, BOUNDS.x0, BOUNDS.x1), y: clamp(l.y + dy, BOUNDS.y0, BOUNDS.y1), s: clamp(l.s + ds / 3, 12, 60) } });
    }
  };

  /* logo propio */
  const onFile = async (file?: File | null) => {
    setMsg(null);
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) return setMsg({ kind: "error", text: "Sube una imagen PNG, JPG, SVG o WEBP." });
    if (file.size > 5 * 1024 * 1024) return setMsg({ kind: "error", text: "La imagen pesa más de 5 MB. Prueba con una versión más liviana." });
    const preview = URL.createObjectURL(file);
    setLogo({ preview, url: null, name: file.name });
    setLogoState("uploading");
    placeDesign({ slug: "tu-logo", name: "Mi logo", image: preview, logo: true });
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const sb = supabase();
    const { error } = await sb.storage.from("logos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setLogoState("error");
      setMsg({ kind: "error", text: "No se pudo subir el logo. Revisa tu conexión e inténtalo otra vez." });
      return;
    }
    const url = sb.storage.from("logos").getPublicUrl(path).data.publicUrl;
    setLogo({ preview, url, name: file.name });
    setLogoState("ready");
  };

  /* resumen y pedido */
  const describe = (s: Side) =>
    [s.design ? s.design.name : null, s.text?.value.trim() ? `texto "${s.text.value.trim()}" (${FONTS.find((f) => f.id === s.text!.font)?.label.toLowerCase()})` : null]
      .filter(Boolean)
      .join(" + ");
  const frontDesc = describe(sides.front);
  const backDesc = describe(sides.back);
  const usesLogo = sides.front.design?.logo || sides.back.design?.logo;

  const addToCart = () => {
    setMsg(null);
    if (!total) return setMsg({ kind: "error", text: "Marca al menos una talla." });
    if (!frontDesc && !backDesc) return setMsg({ kind: "error", text: "Tu camiseta está en blanco. Agrega un diseño o un texto." });
    if (usesLogo && !logo?.url)
      return setMsg({ kind: "error", text: logoState === "uploading" ? "Espera a que termine de subir tu logo." : "Vuelve a subir tu logo antes de pedir." });
    const name = [frontDesc && `Frente: ${frontDesc}`, backDesc && `Espalda: ${backDesc}`].filter(Boolean).join(" · ");
    const main = sides.front.design ?? sides.back.design;
    add(
      Object.entries(counts).map(([size, qty]) => ({
        colorSlug: color.slug,
        colorName: color.name,
        hex: color.hex,
        designSlug: usesLogo ? "tu-logo" : main?.slug ?? "texto",
        designName: name,
        logoUrl: usesLogo ? logo?.url : null,
        size,
        qty,
      }))
    );
    setPrinting((p) => p + 1);
    setMsg({ kind: "ok", text: `¡Impresa! ${total} ${total === 1 ? "camiseta" : "camisetas"} en tu pedido.` });
  };

  // En el celular, al cambiar de herramienta, su contenido aparece justo bajo la camiseta.
  useEffect(() => {
    if (firstTool.current) {
      firstTool.current = false;
      return;
    }
    if (window.innerWidth > 980 || !toolsRef.current || !stageRef.current) return;
    const top = toolsRef.current.getBoundingClientRect().top;
    const limit = stageRef.current.getBoundingClientRect().bottom;
    if (top < limit - 1) window.scrollBy({ top: top - limit, behavior: "smooth" });
  }, [tool]);

  const ti = TOOLS.findIndex((t) => t.id === tool);
  const next = TOOLS[ti + 1];
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(designs.map((d) => d.category).filter(Boolean)))], [designs]);
  const shown = category === "Todos" ? designs : designs.filter((d) => d.category === category);

  const selLayer = sel === "design" ? side.design : sel === "text" ? side.text : null;
  const selBox = selLayer
    ? sel === "design"
      ? { w: (selLayer as DesignLayer).s, h: (selLayer as DesignLayer).s }
      : { w: textWidth(selLayer as TextLayer), h: (selLayer as TextLayer).s * 1.2 }
    : null;

  const canvas = (v: ShirtView, interactive: boolean) => {
    const s = sides[v];
    return (
      <Shirt
        color={color.hex}
        view={v}
        className="lab-shirt-svg"
        title={`Camiseta ${color.name}, ${v === "front" ? "frente" : "espalda"}`}
        overlay={
          interactive && selLayer && selBox ? (
            <g className="sel" transform={`translate(${selLayer.x} ${selLayer.y})`}>
              <rect x={-selBox.w / 2 - 6} y={-selBox.h / 2 - 6} width={selBox.w + 12} height={selBox.h + 12} rx="6" />
              <circle
                className="sel-handle"
                cx={selBox.w / 2 + 6}
                cy={selBox.h / 2 + 6}
                r="7"
                onPointerDown={startDrag("resize")}
                onPointerMove={onMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            </g>
          ) : null
        }
      >
        {s.design && (
          <g
            className={interactive ? "grab" : undefined}
            onPointerDown={interactive ? startDrag("design") : undefined}
            onPointerMove={interactive ? onMove : undefined}
            onPointerUp={interactive ? endDrag : undefined}
            onPointerCancel={interactive ? endDrag : undefined}
          >
            <ArtLayer layer={s.design} inks={inks} stampKey={v === view ? stamp : 0} />
          </g>
        )}
        {s.text?.value.trim() && (
          <g
            className={interactive ? "grab" : undefined}
            onPointerDown={interactive ? startDrag("text") : undefined}
            onPointerMove={interactive ? onMove : undefined}
            onPointerUp={interactive ? endDrag : undefined}
            onPointerCancel={interactive ? endDrag : undefined}
          >
            <WordLayer layer={s.text} stampKey={v === view ? stamp : 0} />
          </g>
        )}
        {interactive && splash && v === view && <Splash x={splash.x} y={splash.y} color={s.design ? inks.a : s.text?.ink ?? inks.a} k={splash.k} />}
      </Shirt>
    );
  };

  return (
    <section className="lab" aria-label="Taller: diseña tu camiseta">
      {/* ───── escenario ───── */}
      <div className="lab-stage" ref={stageRef}>
        <div className="floods" aria-hidden="true">
          {floods.map((f) => (
            <span key={f.k} className="flood" style={{ background: f.tint, ["--fx" as string]: f.fx, ["--fy" as string]: f.fy }} />
          ))}
        </div>

        <div className="lab-head">
          <h1 className="lab-title">
            Diseña tu camiseta. <span>Nosotros la imprimimos.</span>
          </h1>
        </div>

        <div className="side-toggle" role="radiogroup" aria-label="Lado de la camiseta">
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              role="radio"
              aria-checked={view === v}
              onClick={() => {
                setView(v);
                setSel(null);
              }}
            >
              {v === "front" ? "Frente" : "Espalda"}
              {(v === "front" ? frontDesc : backDesc) && <span className="dot" aria-label="con diseño" />}
            </button>
          ))}
        </div>

        <div
          className={`lab-shirt ${printing ? "is-printing" : ""}`}
          key={`p${printing}`}
          tabIndex={0}
          aria-label="Camiseta. Arrastra el diseño o el texto para moverlo. Con el teclado: flechas para mover, más y menos para el tamaño."
          onPointerDown={() => setSel(null)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 12 : 4;
            if (e.key === "ArrowLeft") nudge(-step, 0);
            else if (e.key === "ArrowRight") nudge(step, 0);
            else if (e.key === "ArrowUp") nudge(0, -step);
            else if (e.key === "ArrowDown") nudge(0, step);
            else if (e.key === "+" || e.key === "=") nudge(0, 0, 6);
            else if (e.key === "-") nudge(0, 0, -6);
            else if (e.key === "Tab" || e.key === "Escape") return;
            else if (e.key === " " || e.key === "Enter") setSel((s) => (s === "design" ? (side.text ? "text" : "design") : side.design ? "design" : side.text ? "text" : null));
            else return;
            e.preventDefault();
          }}
        >
          <div className={`lab-flip ${view === "back" ? "is-back" : ""}`}>
            <div className="lab-face front">{canvas("front", view === "front")}</div>
            <div className="lab-face back">{canvas("back", view === "back")}</div>
          </div>
          <span className="lab-floor" aria-hidden="true" />
          {printing > 0 && <span className="print-pass" aria-hidden="true" />}
        </div>

        <button className="flip-btn" onClick={() => { setView((v) => (v === "front" ? "back" : "front")); setSel(null); }}>
          <RotateCcw aria-hidden="true" />
          Dar la vuelta
        </button>
      </div>

      {/* ───── herramientas ───── */}
      <div className="lab-tools" ref={toolsRef}>
        <div className="tool-tabs" role="tablist" aria-label="Herramientas">
          {TOOLS.map(({ id, label, Icon }, i) => (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={tool === id}
              aria-controls={`panel-${id}`}
              tabIndex={tool === id ? 0 : -1}
              onClick={() => setTool(id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const n = TOOLS[(i + (e.key === "ArrowRight" ? 1 : TOOLS.length - 1)) % TOOLS.length];
                setTool(n.id);
                document.getElementById(`tab-${n.id}`)?.focus();
              }}
            >
              <span className="tab-num">{i + 1}</span>
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="tool-panel" role="tabpanel" id={`panel-${tool}`} aria-labelledby={`tab-${tool}`}>
          {tool === "color" && (
            <>
              <h2 className="tool-title">¿De qué color la quieres?</h2>
              <div className="swatch-grid" role="radiogroup" aria-label="Color de camiseta">
                {colors.map((c, i) => (
                  <button key={c.slug} role="radio" aria-checked={i === ci} className="swatch-btn" onClick={(e) => pickColor(i, e)}>
                    <span className="swatch-ball" style={{ ["--c" as string]: c.hex }} aria-hidden="true">
                      {i === ci && <Check />}
                    </span>
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {tool === "diseno" && (
            <>
              <h2 className="tool-title">Elige un diseño para {view === "front" ? "el frente" : "la espalda"}</h2>
              <p className="tool-hint">Tócalo para estamparlo. Después arrástralo sobre la camiseta.</p>
              {categories.length > 2 && (
                <div className="chips" role="radiogroup" aria-label="Categoría">
                  {categories.map((c) => (
                    <button key={c} role="radio" aria-checked={category === c} onClick={() => setCategory(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="sticker-grid">
                <input ref={fileRef} type="file" accept={LOGO_TYPES.join(",")} className="sr-only" id="logo-file" onChange={(e) => onFile(e.target.files?.[0])} />
                <label htmlFor="logo-file" className="sticker upload">
                  <span className="sticker-art">
                    {logoState === "uploading" ? <span className="spinner" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                  </span>
                  <span className="sticker-name">{logo ? "Cambiar logo" : "Sube tu logo"}</span>
                </label>
                {shown.map((d) => {
                  const on = side.design?.slug === d.slug;
                  return (
                    <button key={d.slug} className="sticker" aria-pressed={on} onClick={() => placeDesign({ slug: d.slug, name: d.name, image: d.image_url })}>
                      <span className="sticker-art">
                        {d.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.image_url} alt="" />
                        ) : (
                          <svg viewBox="0 0 200 200" aria-hidden="true">
                            <DesignArt slug={d.slug} inks={inksFor("#F4F4F2")} />
                          </svg>
                        )}
                      </span>
                      <span className="sticker-name">
                        {d.name}
                        {d.is_sample && <em>ejemplo</em>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {side.design && (
                <div className="layer-ctl">
                  <label>
                    Tamaño del diseño
                    <input
                      type="range"
                      min={30}
                      max={150}
                      value={Math.round(side.design.s)}
                      onChange={(e) => setSide({ design: { ...side.design!, s: +e.target.value } })}
                    />
                  </label>
                  <button className="ghost-btn" onClick={() => { setSide({ design: null }); setSel(null); }}>
                    <Trash2 aria-hidden="true" /> Quitar diseño
                  </button>
                </div>
              )}
            </>
          )}

          {tool === "texto" && (
            <>
              <h2 className="tool-title">Ponle tu nombre, un número o una frase</h2>
              <label className="text-field">
                <span className="sr-only">Texto para {view === "front" ? "el frente" : "la espalda"}</span>
                <input
                  type="text"
                  maxLength={TEXT_MAX}
                  placeholder={view === "back" ? "Ej.: VERO 10" : "Ej.: Promo 2027"}
                  value={side.text?.value ?? ""}
                  onChange={(e) => setText({ value: e.target.value })}
                  onBlur={() => side.text?.value.trim() && boom(side.text.x, side.text.y)}
                />
                <span className="count num">
                  {(side.text?.value.length ?? 0)}/{TEXT_MAX}
                </span>
              </label>
              <div className="font-pick" role="radiogroup" aria-label="Estilo de letra">
                {FONTS.map((f) => (
                  <button key={f.id} role="radio" aria-checked={(side.text?.font ?? "deportiva") === f.id} onClick={() => setText({ font: f.id })}>
                    <span style={fontStyle(f.id)}>{side.text?.value.trim() || "Hola"}</span>
                    <small>{f.label}</small>
                  </button>
                ))}
              </div>
              <div className="ink-pick" role="radiogroup" aria-label="Color de la tinta">
                {TEXT_INKS.map((k) => (
                  <button
                    key={k.hex}
                    role="radio"
                    aria-checked={side.text?.ink === k.hex}
                    aria-label={k.name}
                    title={k.name}
                    style={{ ["--c" as string]: k.hex }}
                    onClick={() => setText({ ink: k.hex })}
                  />
                ))}
              </div>
              {side.text?.value.trim() && (
                <div className="layer-ctl">
                  <label>
                    Tamaño del texto
                    <input type="range" min={12} max={60} value={Math.round(side.text.s)} onChange={(e) => setText({ s: +e.target.value })} />
                  </label>
                  <button className="ghost-btn" onClick={() => { setSide({ text: null }); setSel(null); }}>
                    <Trash2 aria-hidden="true" /> Quitar texto
                  </button>
                </div>
              )}
            </>
          )}

          {tool === "tallas" && (
            <>
              <h2 className="tool-title">¿Cuántas y de qué talla?</h2>
              <p className="tool-hint">Puedes mezclar tallas. Desde 12 piezas te cotizamos precio de grupo.</p>
              <ul className="size-grid" aria-label="Tallas y cantidades">
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

              <dl className="recap">
                <div>
                  <dt>Camiseta</dt>
                  <dd>
                    <span className="ink-dot" style={{ background: color.hex }} aria-hidden="true" />
                    {color.name}
                  </dd>
                </div>
                <div>
                  <dt>Frente</dt>
                  <dd>{frontDesc || "Sin diseño"}</dd>
                </div>
                <div>
                  <dt>Espalda</dt>
                  <dd>{backDesc || "Sin diseño"}</dd>
                </div>
                <div>
                  <dt>Piezas</dt>
                  <dd className="num">{total}</dd>
                </div>
              </dl>

              <button className="squeegee wide" onClick={addToCart}>
                <span>
                  <ShoppingBag aria-hidden="true" />
                  {total ? `Imprimir y agregar ${total} al pedido` : "Marca al menos una talla"}
                </span>
              </button>
            </>
          )}

          {msg && (
            <p className={msg.kind === "error" ? "form-error" : "lab-ok"} role={msg.kind === "error" ? "alert" : "status"}>
              {msg.kind === "error" ? <AlertCircle aria-hidden="true" /> : <Check aria-hidden="true" />}
              {msg.text}
              {msg.kind === "ok" && count > 0 && (
                <button className="text-link" onClick={() => setOpen(true)}>
                  Ver pedido
                </button>
              )}
            </p>
          )}

          {next && (
            <button className="next-btn" onClick={() => setTool(next.id)}>
              Siguiente: {next.label} <ArrowRight aria-hidden="true" />
            </button>
          )}
          {!next && (
            <p className="tool-hint">
              <ShirtIcon aria-hidden="true" /> Te confirmamos precio y fecha por WhatsApp antes de imprimir.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
