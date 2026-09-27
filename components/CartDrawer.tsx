"use client";
import { useEffect, useRef, useState } from "react";
import { X, Minus, Plus, Trash2, Send, AlertCircle, Check, ShoppingBag } from "lucide-react";
import Shirt from "./Shirt";
import { useCart } from "@/lib/cart";
import { supabase, whatsappLink } from "@/lib/supabase";
import { useTheme } from "./ThemeProvider";

export default function CartDrawer() {
  const { lines, count, open, setOpen, setQty, remove, clear } = useCart();
  const { theme } = useTheme();
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [err, setErr] = useState("");
  const [lastLink, setLastLink] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, setOpen]);

  const summary = () => {
    const rows = lines
      .map((l) => `• ${l.qty} × ${l.colorName} · ${l.logoUrl ? "Mi logo" : l.designName} · Talla ${l.size}${l.logoUrl ? `\n   Logo: ${l.logoUrl}` : ""}`)
      .join("\n");
    return `Hola Basic&Print, quiero este pedido (${count} camisetas):\n${rows}${form.notes ? `\nNotas: ${form.notes}` : ""}\nNombre: ${form.name}\nTel: ${form.phone}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!lines.length) return;
    if (form.name.trim().length < 2) return setErr("Escribe tu nombre para saber a quién responder.");
    if (form.phone.replace(/\D/g, "").length < 8) return setErr("Escribe un teléfono de 8 dígitos o más.");
    setState("saving");
    const text = summary();
    const link = whatsappLink(text);
    const sb = supabase();
    const orderId = crypto.randomUUID();
    const { data: u } = await sb.auth.getUser();
    const { error } = await sb.from("orders").insert({
      id: orderId,
      user_id: u.user?.id ?? null,
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      quantity: Math.min(500, count),
      total_items: count,
      notes: form.notes.trim() || null,
      style: theme,
    });
    const { error: e2 } = error
      ? { error }
      : await sb.from("order_items").insert(
          lines.map((l) => ({
            order_id: orderId,
            shirt_color: l.colorSlug,
            design_slug: l.logoUrl ? "tu-logo" : l.designSlug,
            logo_url: l.logoUrl ?? null,
            size: l.size,
            quantity: l.qty,
          }))
        );
    setLastLink(link);
    if (error || e2) {
      setState("idle");
      setErr("No pudimos guardar el pedido, pero puedes enviarlo igual por WhatsApp.");
      return;
    }
    setState("done");
    window.open(link, "_blank", "noopener");
    clear();
  };

  return (
    <div className={`cart-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="cart-scrim" onClick={() => setOpen(false)} />
      <div className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-t" ref={panelRef}>
        <div className="cart-head">
          <h2 id="cart-t">
            Tu pedido <span>{count} {count === 1 ? "camiseta" : "camisetas"}</span>
          </h2>
          <button className="icon-btn" ref={closeRef} onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            <X aria-hidden="true" />
          </button>
        </div>

        {state === "done" ? (
          <div className="cart-done" role="status">
            <Check aria-hidden="true" />
            <h3>Pedido enviado</h3>
            <p>Lo guardamos y abrimos WhatsApp con el resumen. Si no se abrió, usa este botón.</p>
            <a className="squeegee" href={lastLink} target="_blank" rel="noopener noreferrer">
              <span>
                <Send aria-hidden="true" /> Abrir WhatsApp
              </span>
            </a>
            <button className="text-link" onClick={() => setState("idle")}>
              Hacer otro pedido
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag aria-hidden="true" />
            <p>Tu carrito está vacío. Gira la prensa, elige diseño y tallas, y agrégalas aquí.</p>
            <button className="text-link" onClick={() => setOpen(false)}>
              Seguir armando
            </button>
          </div>
        ) : (
          <form className="cart-body" onSubmit={submit} noValidate>
            <ul className="cart-lines">
              {lines.map((l) => (
                <li key={l.id}>
                  <Shirt color={l.hex} design={l.designSlug} logoUrl={l.logoUrl} className="cart-shirt" />
                  <div className="cart-line-info">
                    <p className="cart-line-name">{l.logoUrl ? "Mi logo" : l.designName}</p>
                    <p className="cart-line-meta">
                      {l.colorName} · Talla <strong>{l.size}</strong>
                    </p>
                    <div className="stepper sm">
                      <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Menos" disabled={l.qty <= 1}>
                        <Minus aria-hidden="true" />
                      </button>
                      <span aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Más">
                        <Plus aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="icon-btn" onClick={() => remove(l.id)} aria-label={`Quitar ${l.colorName} talla ${l.size}`}>
                    <Trash2 aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-form">
              <label>
                Tu nombre
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" maxLength={80} />
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
                />
              </label>
              <label>
                Notas (opcional)
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  maxLength={500}
                  rows={2}
                  placeholder="Nombres en la espalda, fecha que lo necesitas…"
                />
              </label>
              <p className="price-note">Te confirmamos precio y tiempo de entrega por WhatsApp.</p>
              {err && (
                <p className="form-error" role="alert">
                  <AlertCircle aria-hidden="true" /> {err}{" "}
                  {lastLink && (
                    <a href={lastLink} target="_blank" rel="noopener noreferrer">
                      Enviar por WhatsApp
                    </a>
                  )}
                </p>
              )}
              <button type="submit" className="squeegee wide" disabled={state === "saving"}>
                <span>
                  <Send aria-hidden="true" />
                  {state === "saving" ? "Guardando…" : "Enviar pedido por WhatsApp"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
