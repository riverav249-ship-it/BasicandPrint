"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ImageUp, LayoutGrid, ShoppingCart, Truck, Type, AlertCircle } from "lucide-react";
import Shirt from "@/components/Shirt";
import { DesignArt, inksFor } from "@/lib/designs";
import { useCart } from "@/lib/cart";
import { FALLBACK_DESIGNS, supabase, type Design } from "@/lib/supabase";
import { useShirtColors } from "@/lib/useCatalog";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
type Tool = "texto" | "imagen" | "disenos";

/** Texto del cliente acomodado en hasta 3 líneas dentro del lienzo de 200×200. */
function TextArt({ text, color }: { text: string; color: string }) {
  const words = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= 10 && lines.length) lines[lines.length - 1] = last + " " + w;
    else lines.push(w);
  }
  const shown = lines.slice(0, 3);
  const longest = Math.max(1, ...shown.map((l) => l.length));
  const size = Math.min(58, 300 / longest);
  const top = 100 - ((shown.length - 1) * size * 0.95) / 2 + size * 0.34;
  return (
    <g>
      {shown.map((l, i) => (
        <text
          key={i}
          x="100"
          y={top + i * size * 0.95}
          textAnchor="middle"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fontWeight="900"
          fontSize={size}
          fill={color}
        >
          {l}
        </text>
      ))}
    </g>
  );
}

export default function QuickDesigner() {
  const colors = useShirtColors();
  const { add, setOpen } = useCart();
  const [ci, setCi] = useState(1); // negra, como en el diseño de referencia
  const [size, setSize] = useState<string>("M");
  const [tool, setTool] = useState<Tool>("disenos");
  const [text, setText] = useState("");
  const [designs, setDesigns] = useState<Design[]>(FALLBACK_DESIGNS.filter((d) => d.slug !== "tu-logo"));
  const [design, setDesign] = useState("olas");
  const [img, setImg] = useState<{ preview: string; url: string | null } | null>(null);
  const [upState, setUpState] = useState<"idle" | "up" | "ok" | "err">("idle");
  const [upErr, setUpErr] = useState("");
  const [added, setAdded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase()
      .from("designs")
      .select("slug,name,category,ink_note,is_sample,image_url")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => {
        const list = (data ?? []).filter((d) => d.slug !== "tu-logo");
        if (list.length) setDesigns(list);
      });
  }, []);

  const color = colors[Math.min(ci, colors.length - 1)];
  const inks = inksFor(color.hex);
  const chosen = designs.find((d) => d.slug === design) ?? designs[0];

  // Lo que va impreso según la herramienta activa
  const print = useMemo(() => {
    if (tool === "texto" && text.trim()) return { art: <TextArt text={text} color={inks.base} />, slug: "texto", name: `Texto: “${text.trim()}”` };
    if (tool === "imagen" && img) return { image: img.url ?? img.preview, slug: "tu-logo", name: "Diseño propio (imagen)", logoUrl: img.url };
    return { design: chosen?.slug, image: chosen?.image_url ?? null, slug: chosen?.slug ?? "", name: chosen?.name ?? "" };
  }, [tool, text, img, chosen, inks.base]);

  const onFile = async (f?: File | null) => {
    setUpErr("");
    if (!f) return;
    if (!TYPES.includes(f.type)) return (setUpState("err"), setUpErr("Sube una imagen PNG, JPG, SVG o WEBP."));
    if (f.size > 5 * 1024 * 1024) return (setUpState("err"), setUpErr("La imagen pesa más de 5 MB. Prueba con una más liviana."));
    const preview = URL.createObjectURL(f);
    setImg({ preview, url: null });
    setTool("imagen");
    setUpState("up");
    const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const sb = supabase();
    const { error } = await sb.storage.from("logos").upload(path, f, { contentType: f.type, upsert: false });
    if (error) return (setUpState("err"), setUpErr("No se pudo subir la imagen. Revisa tu conexión e inténtalo otra vez."));
    setImg({ preview, url: sb.storage.from("logos").getPublicUrl(path).data.publicUrl });
    setUpState("ok");
  };

  const canAdd = !(tool === "imagen" && upState === "up") && !(tool === "texto" && !text.trim());

  const addToCart = () => {
    if (!canAdd) return;
    add([
      {
        colorSlug: color.slug,
        colorName: color.name,
        hex: color.hex,
        designSlug: print.slug,
        designName: print.name,
        logoUrl: "logoUrl" in print ? print.logoUrl ?? null : null,
        size,
        qty: 1,
      },
    ]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
    setOpen(true);
  };

  return (
    <div className="qd">
      <div className="qd-tools" role="tablist" aria-label="Herramientas de diseño">
        {(
          [
            ["texto", "Texto", Type],
            ["imagen", "Imagen", ImageUp],
            ["disenos", "Diseños", LayoutGrid],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tool === id}
            className="qd-tool"
            onClick={() => (id === "imagen" && !img ? fileRef.current?.click() : setTool(id))}
          >
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
        <input
          ref={fileRef}
          type="file"
          accept={TYPES.join(",")}
          className="sr-only"
          aria-label="Subir imagen para estampar"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="qd-canvas">
        <Shirt
          color={color.hex}
          photo={color.image_url}
          art={"art" in print ? print.art : undefined}
          design={"design" in print ? print.design : null}
          designImage={"image" in print ? print.image : null}
          className="qd-shirt"
          title={`Vista previa: camiseta ${color.name}`}
        />
        <div className="qd-panel">
          {tool === "texto" && (
            <label className="qd-field" htmlFor="qd-text">
              Escribe tu frase
              <input
                id="qd-text"
                value={text}
                maxLength={30}
                placeholder="Ej.: Familia Rivera 2026"
                onChange={(e) => setText(e.target.value)}
              />
            </label>
          )}
          {tool === "imagen" && (
            <div className="qd-up">
              <button type="button" className="qd-mini-btn" onClick={() => fileRef.current?.click()}>
                <ImageUp aria-hidden="true" /> {img ? "Cambiar imagen" : "Subir imagen"}
              </button>
              <span role="status" className={upState === "err" ? "qd-err" : "qd-hint"}>
                {upState === "up" && "Subiendo…"}
                {upState === "ok" && (
                  <>
                    <Check aria-hidden="true" /> Lista para imprimir
                  </>
                )}
                {upState === "err" && (
                  <>
                    <AlertCircle aria-hidden="true" /> {upErr}
                  </>
                )}
                {upState === "idle" && "PNG con fondo transparente se ve mejor."}
              </span>
            </div>
          )}
          {tool === "disenos" && (
            <ul className="qd-designs" aria-label="Diseños de muestra">
              {designs.map((d) => (
                <li key={d.slug}>
                  <button type="button" aria-pressed={d.slug === chosen?.slug} onClick={() => setDesign(d.slug)} title={d.name}>
                    {d.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image_url} alt="" />
                    ) : (
                      <svg viewBox="0 0 200 200" aria-hidden="true">
                        <DesignArt slug={d.slug} inks={inksFor("#F2F2EF")} />
                      </svg>
                    )}
                    <span className="sr-only">{d.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="qd-card" aria-label="Color, talla y carrito">
        <h3>Colores de camiseta</h3>
        <div className="qd-swatches" role="radiogroup" aria-label="Color de camiseta">
          {colors.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              role="radio"
              aria-checked={i === ci}
              aria-label={c.name}
              title={c.name}
              className="qd-swatch"
              style={{ background: c.hex }}
              onClick={() => setCi(i)}
            />
          ))}
        </div>
        <h3>Tallas</h3>
        <div className="qd-sizes" role="radiogroup" aria-label="Talla">
          {SIZES.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={size === s} className="qd-size" onClick={() => setSize(s)}>
              {s}
            </button>
          ))}
        </div>
        <button type="button" className="qd-add" onClick={addToCart} disabled={!canAdd}>
          {added ? (
            <>
              <Check aria-hidden="true" /> Agregada
            </>
          ) : (
            <>
              Agregar al carrito <ShoppingCart aria-hidden="true" />
            </>
          )}
        </button>
        {tool === "texto" && !text.trim() && <p className="qd-hint">Escribe tu frase para agregarla.</p>}
        <p className="qd-ship">
          <Truck aria-hidden="true" /> Envío disponible a todo El Salvador
        </p>
        <Link href="/disenar" className="qd-more">
          Más opciones: espalda, varias tallas <ArrowRight aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
