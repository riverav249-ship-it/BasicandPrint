"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, RefreshCw, Save, Trash2, Plus, ExternalLink } from "lucide-react";
import SignIn from "@/components/SignIn";
import Shirt from "@/components/Shirt";
import RegMark from "@/components/RegMark";
import { CrudTable, ImageUpload, Notice, slugify } from "@/components/admin/Crud";
import { DesignArt, inksFor } from "@/lib/designs";
import { useAuth } from "@/lib/useAuth";
import { FALLBACK_COLORS, supabase } from "@/lib/supabase";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Niño"];
const STATUSES = [
  { v: "nuevo", l: "Nuevo" },
  { v: "confirmado", l: "Confirmado" },
  { v: "en_produccion", l: "En producción" },
  { v: "entregado", l: "Entregado" },
  { v: "cancelado", l: "Cancelado" },
];
const TABS = [
  { id: "pedidos", l: "Pedidos" },
  { id: "inventario", l: "Inventario" },
  { id: "disenos", l: "Diseños" },
  { id: "promos", l: "Promociones" },
  { id: "retos", l: "Retos" },
  { id: "ajustes", l: "Precios y ajustes" },
  { id: "mensajes", l: "Mensajes" },
  { id: "equipo", l: "Equipo" },
] as const;
type Tab = (typeof TABS)[number]["id"];

type Item = {
  id: string;
  shirt_color: string;
  design_slug: string;
  logo_url: string | null;
  size: string;
  quantity: number;
  unit_price?: number | null;
  custom_text?: string | null;
  printed?: boolean;
};
type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  notes: string | null;
  status: string;
  admin_note: string | null;
  total_items: number | null;
  subtotal?: number | null;
  quantity: number;
  shirt_color: string | null;
  design_slug: string | null;
  size: string | null;
  order_items: Item[];
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("es-SV", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const hexOf = (slug: string, colors: { slug: string; hex: string }[]) =>
  colors.find((c) => c.slug === slug)?.hex ?? FALLBACK_COLORS.find((c) => c.slug === slug)?.hex ?? "#ddd";

/* ─────────────── Pedidos ─────────────── */
function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [colors, setColors] = useState<{ slug: string; name: string; hex: string }[]>([]);
  const [filter, setFilter] = useState("activos");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const sb = supabase();
    const [{ data }, { data: c }] = await Promise.all([
      sb.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(200),
      sb.from("shirt_colors").select("slug,name,hex"),
    ]);
    setOrders((data as Order[]) ?? []);
    setColors(c ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const shown = orders.filter((o) =>
    filter === "todos" ? true : filter === "activos" ? !["entregado", "cancelado"].includes(o.status) : o.status === filter
  );

  const update = async (o: Order, patch: Partial<Order>) => {
    const { error } = await supabase().from("orders").update(patch).eq("id", o.id);
    setMsg(error ? "No se guardó el cambio." : "");
    if (!error) setOrders((x) => x.map((y) => (y.id === o.id ? { ...y, ...patch } : y)));
  };

  return (
    <section className="adm-section">
      <div className="adm-head">
        <div>
          <h2>Pedidos</h2>
          <p className="adm-help">Cada pedido llega aquí cuando el cliente lo envía por WhatsApp desde el carrito.</p>
        </div>
        <div className="adm-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar pedidos">
            <option value="activos">Activos</option>
            <option value="todos">Todos</option>
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>
          <button className="adm-btn ghost" onClick={load} aria-label="Recargar">
            <RefreshCw aria-hidden="true" />
          </button>
        </div>
      </div>
      {msg && <Notice kind="err">{msg}</Notice>}
      {shown.length === 0 && <p className="empty">No hay pedidos en esta vista.</p>}
      <ul className="adm-orders">
        {shown.map((o) => {
          const items: Item[] = o.order_items?.length
            ? o.order_items
            : o.shirt_color
              ? [{ id: o.id, shirt_color: o.shirt_color, design_slug: o.design_slug ?? "", logo_url: null, size: o.size ?? "", quantity: o.quantity }]
              : [];
          const total = o.total_items ?? items.reduce((s, i) => s + i.quantity, 0);
          return (
            <li key={o.id} className={`status-${o.status}`}>
              <div className="adm-order-head">
                <div>
                  <h3>{o.customer_name}</h3>
                  <p className="adm-help">
                    {when(o.created_at)} · {total} camisetas ·{" "}
                    {o.subtotal != null && <strong>${Number(o.subtotal).toFixed(2)} · </strong>}
                    <a href={`https://wa.me/${o.phone.replace(/\D/g, "").replace(/^(\d{8})$/, "503$1")}`} target="_blank" rel="noopener noreferrer">
                      {o.phone}
                    </a>
                  </p>
                </div>
                <select value={o.status} onChange={(e) => update(o, { status: e.target.value })} aria-label="Estado del pedido">
                  {STATUSES.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.l}
                    </option>
                  ))}
                </select>
              </div>
              <ul className="adm-items">
                {items.map((i) => (
                  <li key={i.id}>
                    <Shirt color={hexOf(i.shirt_color, colors)} design={i.design_slug} logoUrl={i.logo_url} className="adm-mini" />
                    <span>
                      <strong>{i.quantity}×</strong> {colors.find((c) => c.slug === i.shirt_color)?.name ?? i.shirt_color} ·{" "}
                      {i.printed === false ? "básica" : i.custom_text ? `texto “${i.custom_text}”` : i.design_slug} · {i.size}
                      {i.unit_price != null && ` · $${Number(i.unit_price).toFixed(2)} c/u`}
                    </span>
                    {i.logo_url && (
                      <a href={i.logo_url} target="_blank" rel="noopener noreferrer" className="text-link">
                        Logo <ExternalLink aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {o.notes && <p className="adm-note">Notas del cliente: {o.notes}</p>}
              <label className="adm-inline">
                Nota interna
                <input
                  defaultValue={o.admin_note ?? ""}
                  onBlur={(e) => e.target.value !== (o.admin_note ?? "") && update(o, { admin_note: e.target.value || null })}
                  placeholder="Precio acordado, fecha de entrega…"
                />
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────── Existencias por color y talla ─────────────── */
function Stock() {
  const [colors, setColors] = useState<{ slug: string; name: string; hex: string }[]>([]);
  const [grid, setGrid] = useState<Record<string, Record<string, string>>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const [{ data: c }, { data: inv }] = await Promise.all([
      sb.from("shirt_colors").select("slug,name,hex").order("sort"),
      sb.from("inventory").select("*"),
    ]);
    setColors(c ?? []);
    const g: Record<string, Record<string, string>> = {};
    (inv ?? []).forEach((r) => ((g[r.color_slug] ??= {})[r.size] = String(r.stock)));
    setGrid(g);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setMsg(null);
    const sb = supabase();
    const upserts: { color_slug: string; size: string; stock: number }[] = [];
    const deletes: { color_slug: string; size: string }[] = [];
    colors.forEach((c) =>
      SIZES.forEach((s) => {
        const v = grid[c.slug]?.[s];
        if (v === undefined || v === "") deletes.push({ color_slug: c.slug, size: s });
        else upserts.push({ color_slug: c.slug, size: s, stock: Math.max(0, parseInt(v, 10) || 0) });
      })
    );
    const { error } = upserts.length ? await sb.from("inventory").upsert(upserts) : { error: null };
    for (const d of deletes) await sb.from("inventory").delete().eq("color_slug", d.color_slug).eq("size", d.size);
    setMsg(error ? { kind: "err", text: "No se guardó: " + error.message } : { kind: "ok", text: "Existencias guardadas." });
  };

  return (
    <section className="adm-section">
      <div className="adm-head">
        <div>
          <h2>Existencias por talla</h2>
          <p className="adm-help">
            Escribe cuántas camisetas lisas tienes. Con 0 la talla aparece “Agotada”. Deja vacío para no controlar existencias.
          </p>
        </div>
        <button className="adm-btn" onClick={save}>
          <Save aria-hidden="true" /> Guardar existencias
        </button>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <div className="adm-stock-wrap">
        <table className="adm-stock">
          <thead>
            <tr>
              <th scope="col">Color</th>
              {SIZES.map((s) => (
                <th key={s} scope="col">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((c) => (
              <tr key={c.slug}>
                <th scope="row">
                  <span className="ink-dot" style={{ background: c.hex }} /> {c.name}
                </th>
                {SIZES.map((s) => (
                  <td key={s}>
                    <input
                      inputMode="numeric"
                      aria-label={`${c.name} talla ${s}`}
                      value={grid[c.slug]?.[s] ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        setGrid((g) => ({ ...g, [c.slug]: { ...(g[c.slug] ?? {}), [s]: e.target.value.replace(/\D/g, "") } }))
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─────────────── Ajustes y redes ─────────────── */
function SettingsPanel() {
  const KEYS = [
    { k: "whatsapp", l: "WhatsApp del negocio (con 503, sin signos)", ph: "50376377821" },
    { k: "facebook", l: "Facebook (enlace o usuario)", ph: "facebook.com/basicandprint" },
    { k: "instagram", l: "Instagram (usuario)", ph: "@basicandprint" },
    { k: "tiktok", l: "TikTok (usuario)", ph: "@basicandprint" },
    { k: "price_basic", l: "Precio básica (1 a 9), en dólares", ph: "8" },
    { k: "price_basic_pack", l: "Precio básica en paquete, c/u", ph: "6" },
    { k: "price_print", l: "Precio con serigrafía (1 a 9)", ph: "12" },
    { k: "price_print_pack", l: "Precio con serigrafía en paquete, c/u", ph: "10" },
    { k: "price_pack_min", l: "Cantidad mínima para precio de paquete", ph: "10" },
    { k: "price_note", l: "Mensaje en el carrito (envíos y entrega)", ph: "Envío a todo El Salvador en pedidos de 10 camisetas o más." },
  ];
  const [vals, setVals] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  useEffect(() => {
    supabase()
      .from("settings")
      .select("key,value")
      .then(({ data }) => setVals(Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))));
  }, []);
  const save = async () => {
    const { error } = await supabase()
      .from("settings")
      .upsert(KEYS.map(({ k }) => ({ key: k, value: (vals[k] ?? "").trim() })));
    setMsg(error ? { kind: "err", text: "No se guardó: " + error.message } : { kind: "ok", text: "Ajustes guardados. Los íconos aparecen en el sitio al recargar." });
  };
  return (
    <section className="adm-section">
      <div className="adm-head">
        <div>
          <h2>Precios, redes y ajustes</h2>
          <p className="adm-help">
            Los precios se aplican en todo el sitio al recargar. Escribe solo el número (ej. 12 o 12.50). Cada red social aparece solo cuando
            tiene enlace.
          </p>
        </div>
        <button className="adm-btn" onClick={save}>
          <Save aria-hidden="true" /> Guardar
        </button>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <div className="adm-form">
        {KEYS.map(({ k, l, ph }) => (
          <label key={k}>
            {l}
            <input value={vals[k] ?? ""} placeholder={ph} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <p className="adm-help">
        Nota: el número de WhatsApp de los botones del sitio también está configurado en Vercel (NEXT_PUBLIC_WHATSAPP). Si cambias de número,
        cámbialo en ambos lugares.
      </p>
    </section>
  );
}

/* ─────────────── Mensajes de contacto ─────────────── */
function Messages() {
  const [rows, setRows] = useState<
    { id: string; created_at: string; name: string; email: string | null; phone: string | null; topic: string; message: string; handled: boolean }[]
  >([]);
  const load = useCallback(async () => {
    const { data } = await supabase().from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="adm-section">
      <div className="adm-head">
        <h2>Mensajes del formulario</h2>
        <button className="adm-btn ghost" onClick={load} aria-label="Recargar">
          <RefreshCw aria-hidden="true" />
        </button>
      </div>
      {rows.length === 0 && <p className="empty">Sin mensajes todavía.</p>}
      <ul className="adm-orders">
        {rows.map((m) => (
          <li key={m.id} className={m.handled ? "status-entregado" : "status-nuevo"}>
            <div className="adm-order-head">
              <div>
                <h3>{m.name}</h3>
                <p className="adm-help">
                  {when(m.created_at)} · {m.topic} · {m.email ?? ""} {m.phone ?? ""}
                </p>
              </div>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={m.handled}
                  onChange={async (e) => {
                    const handled = e.target.checked;
                    await supabase().from("contact_messages").update({ handled }).eq("id", m.id);
                    setRows((x) => x.map((y) => (y.id === m.id ? { ...y, handled } : y)));
                  }}
                />
                Atendido
              </label>
            </div>
            <p>{m.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─────────────── Equipo (administradoras) ─────────────── */
function Team({ me }: { me: string }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabase().from("admins").select("email").order("created_at");
    setEmails((data ?? []).map((r) => r.email));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="adm-section">
      <div className="adm-head">
        <div>
          <h2>Equipo</h2>
          <p className="adm-help">Estas personas pueden entrar a este panel con su correo.</p>
        </div>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <ul className="adm-team">
        {emails.map((e) => (
          <li key={e}>
            {e}
            {e.toLowerCase() !== me.toLowerCase() && (
              <button
                className="adm-btn ghost danger"
                aria-label={`Quitar ${e}`}
                onClick={async () => {
                  if (!window.confirm(`¿Quitar el acceso de ${e}?`)) return;
                  await supabase().from("admins").delete().eq("email", e);
                  load();
                }}
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="adm-inline-form"
        onSubmit={async (ev) => {
          ev.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg({ kind: "err", text: "Correo no válido." });
          const { error } = await supabase().from("admins").insert({ email: email.trim().toLowerCase() });
          setMsg(error ? { kind: "err", text: "No se agregó: " + error.message } : { kind: "ok", text: "Acceso agregado." });
          setEmail("");
          load();
        }}
      >
        <label>
          Correo de la nueva administradora
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hermana@correo.com" />
        </label>
        <button className="adm-btn">
          <Plus aria-hidden="true" /> Dar acceso
        </button>
      </form>
    </section>
  );
}

/* ─────────────── Página ─────────────── */
export default function Admin() {
  const { user, ready, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("pedidos");
  const inks = useMemo(() => inksFor("#EDEDEA"), []);

  useEffect(() => {
    if (!user) return setIsAdmin(null);
    supabase()
      .rpc("is_admin")
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return (
    <div className="admin">
      <header className="adm-top">
        <Link href="/" className="wordmark">
          <RegMark />
          <span>
            Basic<em>&amp;</em>Print
          </span>
          <small>Panel</small>
        </Link>
        {user && (
          <p className="session-line">
            {user.email}
            <button className="text-link" onClick={signOut}>
              <LogOut aria-hidden="true" /> Salir
            </button>
          </p>
        )}
      </header>

      {!ready ? (
        <p className="empty adm-pad">Cargando…</p>
      ) : !user ? (
        <div className="adm-pad">
          <SignIn reason="Entra con el correo de administradora. Te llegará un enlace para abrir el panel." />
        </div>
      ) : isAdmin === false ? (
        <div className="adm-pad">
          <Notice kind="err">Esta cuenta no tiene permiso de administración. Pide acceso a una administradora.</Notice>
        </div>
      ) : isAdmin === null ? (
        <p className="empty adm-pad">Verificando permisos…</p>
      ) : (
        <div className="adm-layout">
          <nav className="adm-tabs" aria-label="Secciones del panel">
            {TABS.map((t) => (
              <button key={t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
                {t.l}
              </button>
            ))}
          </nav>
          <div className="adm-main">
            {tab === "pedidos" && <Orders />}
            {tab === "inventario" && (
              <>
                <CrudTable
                  title="Colores de camiseta"
                  help="Los colores activos aparecen en el carrusel, en el orden indicado. Sube una foto de frente en PNG o WEBP sin fondo, con el mismo encuadre que las demás."
                  table="shirt_colors"
                  keyField="slug"
                  newRow={{ name: "", hex: "#FFFFFF", sort: 99, active: true, image_url: null }}
                  beforeInsert={(r) => ({ ...r, slug: slugify(String(r.name || "color")) })}
                  preview={(r) => (
                    <Shirt color={String(r.hex || "#ffffff")} photo={(r.image_url as string) || null} className="adm-mini" />
                  )}
                  extra={(r, patch) => (
                    <div className="adm-extra">
                      <ImageUpload bucket="productos" onUploaded={(url) => patch({ image_url: url })} label={r.image_url ? "Cambiar foto" : "Subir foto"} />
                      {Boolean(r.image_url) && (
                        <button type="button" className="text-link" onClick={() => patch({ image_url: null })}>
                          Quitar foto
                        </button>
                      )}
                    </div>
                  )}
                  fields={[
                    { key: "name", label: "Nombre" },
                    { key: "hex", label: "Color", type: "color" },
                    { key: "sort", label: "Orden", type: "number" },
                    { key: "active", label: "Visible en la tienda", type: "bool" },
                  ]}
                />
                <Stock />
              </>
            )}
            {tab === "disenos" && (
              <CrudTable
                title="Diseños de serigrafía"
                help="Sube el arte en PNG (fondo transparente) o SVG. Los diseños activos aparecen en el carrusel de pantallas. Desmarca “Es ejemplo” cuando sea un diseño real."
                table="designs"
                keyField="slug"
                newRow={{ name: "", category: "General", ink_note: "1 tinta", sort: 99, active: true, is_sample: false, image_url: null }}
                beforeInsert={(r) => ({ ...r, slug: `${slugify(String(r.name || "diseno"))}-${Date.now().toString(36).slice(-4)}` })}
                preview={(r) =>
                  r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={String(r.image_url)} alt="" className="adm-art" />
                  ) : r.slug ? (
                    <svg viewBox="0 0 200 200" className="adm-art" aria-hidden="true">
                      <DesignArt slug={String(r.slug)} inks={inks} />
                    </svg>
                  ) : (
                    <span className="adm-art empty-art">Sin imagen</span>
                  )
                }
                extra={(r, patch) => (
                  <div className="adm-extra">
                    <ImageUpload bucket="designs" onUploaded={(url) => patch({ image_url: url })} label={r.image_url ? "Cambiar imagen" : "Subir imagen"} />
                    {Boolean(r.image_url) && (
                      <button type="button" className="text-link" onClick={() => patch({ image_url: null })}>
                        Quitar imagen
                      </button>
                    )}
                  </div>
                )}
                fields={[
                  { key: "name", label: "Nombre" },
                  { key: "category", label: "Categoría" },
                  { key: "ink_note", label: "Tintas" },
                  { key: "sort", label: "Orden", type: "number" },
                  { key: "active", label: "Visible", type: "bool" },
                  { key: "is_sample", label: "Es ejemplo", type: "bool" },
                ]}
              />
            )}
            {tab === "promos" && (
              <CrudTable
                title="Promociones"
                table="promotions"
                newRow={{ title: "", description: "", badge: "", code: "", ends_at: null, active: true, is_sample: false, sort: 99 }}
                fields={[
                  { key: "badge", label: "Etiqueta grande (ej. 2x1, -15%)" },
                  { key: "title", label: "Título" },
                  { key: "description", label: "Descripción", type: "textarea", width: "2" },
                  { key: "code", label: "Código (opcional)" },
                  { key: "ends_at", label: "Válida hasta", type: "date" },
                  { key: "sort", label: "Orden", type: "number" },
                  { key: "active", label: "Visible", type: "bool" },
                ]}
              />
            )}
            {tab === "retos" && (
              <CrudTable
                title="Retos de racha"
                help="Los clientes marcan un día a la vez. Si faltan un día, la racha vuelve a cero."
                table="challenges"
                newRow={{ title: "", description: "", goal_days: 7, prize: "", active: true, is_sample: false, sort: 99 }}
                beforeInsert={(r) => ({ ...r, slug: `${slugify(String(r.title || "reto"))}-${Date.now().toString(36).slice(-4)}` })}
                fields={[
                  { key: "title", label: "Título" },
                  { key: "goal_days", label: "Días seguidos", type: "number" },
                  { key: "prize", label: "Premio" },
                  { key: "description", label: "Descripción", type: "textarea", width: "2" },
                  { key: "sort", label: "Orden", type: "number" },
                  { key: "active", label: "Visible", type: "bool" },
                  { key: "is_sample", label: "Es ejemplo", type: "bool" },
                ]}
              />
            )}
            {tab === "ajustes" && <SettingsPanel />}
            {tab === "mensajes" && <Messages />}
            {tab === "equipo" && <Team me={user.email ?? ""} />}
          </div>
        </div>
      )}
    </div>
  );
}
