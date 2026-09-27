"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Pencil, Trash2, Send, LogOut, AlertCircle } from "lucide-react";
import Shirt from "@/components/Shirt";
import SignIn from "@/components/SignIn";
import { useAuth } from "@/lib/useAuth";
import { FALLBACK_COLORS, FALLBACK_DESIGNS, supabase } from "@/lib/supabase";

type Msg = { id: string; created_at: string; user_id: string; nickname: string; body: string };
type Idea = {
  id: string;
  created_at: string;
  user_id: string;
  nickname: string;
  title: string;
  description: string | null;
  shirt_color: string | null;
  design_slug: string | null;
  votes_count: number;
  comments_count: number;
};
type Comment = { id: string; idea_id: string; user_id: string; nickname: string; body: string; created_at: string };

const colorHex = (slug?: string | null) => FALLBACK_COLORS.find((c) => c.slug === slug)?.hex ?? "#F4F4F2";
const time = (iso: string) =>
  new Date(iso).toLocaleString("es-SV", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/* ─────────────── Chat en vivo ─────────────── */
function Chat({ uid, nickname }: { uid?: string; nickname?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sb = supabase();
    sb.from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        setMsgs((data ?? []).reverse());
        setLoading(false);
      });
    const ch = sb
      .channel("chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) =>
        setMsgs((m) => (m.some((x) => x.id === (p.new as Msg).id) ? m : [...m, p.new as Msg]))
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (p) =>
        setMsgs((m) => m.filter((x) => x.id !== (p.old as Msg).id))
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !nickname || !body.trim()) return;
    setErr("");
    const text = body.trim().slice(0, 400);
    setBody("");
    const { data, error } = await supabase()
      .from("chat_messages")
      .insert({ user_id: uid, nickname, body: text })
      .select()
      .single();
    if (error) {
      setErr("No se envió el mensaje. Intenta de nuevo.");
      setBody(text);
    } else setMsgs((m) => (m.some((x) => x.id === data.id) ? m : [...m, data]));
  };

  return (
    <section className="chat" aria-labelledby="chat-t">
      <div className="chat-head">
        <h2 id="chat-t">Chat del taller</h2>
        <span className="live-dot">En vivo</span>
      </div>
      <ol className="chat-list" ref={listRef} aria-live="polite">
        {loading && <li className="empty">Cargando mensajes…</li>}
        {!loading && msgs.length === 0 && <li className="empty">Todavía no hay mensajes. Saluda y estrena el chat.</li>}
        {msgs.map((m) => (
          <li key={m.id} className={m.user_id === uid ? "mine" : ""}>
            <p className="who">
              {m.nickname} <time dateTime={m.created_at}>{time(m.created_at)}</time>
            </p>
            <p className="body">{m.body}</p>
            {m.user_id === uid && (
              <button
                className="icon-btn"
                aria-label="Borrar mensaje"
                onClick={async () => {
                  await supabase().from("chat_messages").delete().eq("id", m.id);
                  setMsgs((x) => x.filter((y) => y.id !== m.id));
                }}
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ol>
      {uid ? (
        <form className="chat-form" onSubmit={send}>
          <label className="sr-only" htmlFor="chat-in">
            Mensaje
          </label>
          <input id="chat-in" value={body} onChange={(e) => setBody(e.target.value)} maxLength={400} placeholder="Escribe al taller y a otros clientes…" />
          <button className="round-btn" aria-label="Enviar mensaje" disabled={!body.trim()}>
            <Send aria-hidden="true" />
          </button>
        </form>
      ) : (
        <p className="chat-locked">Entra con tu correo para escribir en el chat.</p>
      )}
      {err && (
        <p className="form-error" role="alert">
          <AlertCircle aria-hidden="true" /> {err}
        </p>
      )}
    </section>
  );
}

/* ─────────────── Formulario de idea (crear / editar) ─────────────── */
function IdeaForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Idea>;
  onSave: (v: { title: string; description: string; shirt_color: string; design_slug: string }) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [shirt, setShirt] = useState(initial?.shirt_color ?? "negro");
  const [design, setDesign] = useState(initial?.design_slug ?? "torogoz");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="idea-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (title.trim().length < 3) return setErr("Ponle un título de al menos 3 letras.");
        setBusy(true);
        const res = await onSave({ title: title.trim(), description: description.trim(), shirt_color: shirt, design_slug: design });
        setBusy(false);
        if (res) setErr(res);
        else if (!initial?.id) {
          setTitle("");
          setDescription("");
          setErr("");
        }
      }}
    >
      <div className="idea-form-preview" aria-hidden="true">
        <Shirt color={colorHex(shirt)} design={design} />
      </div>
      <div className="idea-form-fields">
        <label>
          Título de tu idea
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ej.: Torogoz para la excursión familiar" />
        </label>
        <label>
          Cuéntanos más
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} rows={3} placeholder="Colores, frase, para qué evento…" />
        </label>
        <fieldset className="swatches">
          <legend>Color de camiseta</legend>
          {FALLBACK_COLORS.map((c) => (
            <label key={c.slug} className="swatch-pick" title={c.name}>
              <input type="radio" name="shirt" checked={shirt === c.slug} onChange={() => setShirt(c.slug)} />
              <span style={{ background: c.hex }} />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </fieldset>
        <label>
          Diseño base
          <select value={design} onChange={(e) => setDesign(e.target.value)}>
            {FALLBACK_DESIGNS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        {err && (
          <p className="form-error" role="alert">
            <AlertCircle aria-hidden="true" /> {err}
          </p>
        )}
        <div className="form-actions">
          <button className="squeegee" disabled={busy}>
            <span>{busy ? "Guardando…" : initial?.id ? "Guardar cambios" : "Publicar idea"}</span>
          </button>
          {onCancel && (
            <button type="button" className="text-link" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

/* ─────────────── Tarjeta de idea ─────────────── */
function IdeaItem({
  idea,
  uid,
  nickname,
  voted,
  onVote,
  onUpdate,
  onDelete,
}: {
  idea: Idea;
  uid?: string;
  nickname?: string;
  voted: boolean;
  onVote: () => void;
  onUpdate: (patch: Partial<Idea>) => Promise<string | null>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [openC, setOpenC] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const mine = uid === idea.user_id;
  const designName = FALLBACK_DESIGNS.find((d) => d.slug === idea.design_slug)?.name;

  useEffect(() => {
    if (!openC) return;
    const sb = supabase();
    sb.from("idea_comments")
      .select("*")
      .eq("idea_id", idea.id)
      .order("created_at")
      .then(({ data }) => setComments(data ?? []));
    const ch = sb
      .channel(`c-${idea.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "idea_comments", filter: `idea_id=eq.${idea.id}` },
        (p) => setComments((c) => (c.some((x) => x.id === (p.new as Comment).id) ? c : [...c, p.new as Comment]))
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [openC, idea.id]);

  if (editing)
    return (
      <li className="idea is-editing">
        <IdeaForm
          initial={idea}
          onCancel={() => setEditing(false)}
          onSave={async (v) => {
            const r = await onUpdate(v);
            if (!r) setEditing(false);
            return r;
          }}
        />
      </li>
    );

  return (
    <li className="idea">
      <div className="idea-shirt" aria-hidden="true">
        <Shirt color={colorHex(idea.shirt_color)} design={idea.design_slug} />
      </div>
      <div className="idea-body">
        <h3>{idea.title}</h3>
        <p className="idea-meta">
          {idea.nickname} · {time(idea.created_at)}
          {designName ? ` · ${designName}` : ""}
        </p>
        {idea.description && <p className="idea-desc">{idea.description}</p>}
        <div className="idea-actions">
          <button
            className={`chip-btn ${voted ? "is-on" : ""}`}
            aria-pressed={voted}
            onClick={onVote}
            disabled={!uid}
            title={uid ? undefined : "Entra para votar"}
          >
            <Heart aria-hidden="true" /> {idea.votes_count}
            <span className="sr-only"> votos</span>
          </button>
          <button className="chip-btn" aria-expanded={openC} onClick={() => setOpenC((o) => !o)}>
            <MessageCircle aria-hidden="true" /> {idea.comments_count}
            <span className="sr-only"> comentarios</span>
          </button>
          <Link
            className="text-link"
            href={`/?diseno=${idea.design_slug ?? ""}&color=${idea.shirt_color ?? ""}`}
          >
            Pedir esta
          </Link>
          {mine && (
            <>
              <button className="icon-btn" aria-label="Editar idea" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
              </button>
              <button
                className="icon-btn"
                aria-label="Borrar idea"
                onClick={() => {
                  if (window.confirm("¿Borrar esta idea?")) onDelete();
                }}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        {openC && (
          <div className="comments">
            <ul>
              {comments.length === 0 && <li className="empty">Sin comentarios todavía.</li>}
              {comments.map((c) => (
                <li key={c.id}>
                  <strong>{c.nickname}</strong> {c.body}
                </li>
              ))}
            </ul>
            {uid && nickname ? (
              <form
                className="chat-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const body = text.trim().slice(0, 400);
                  if (!body) return;
                  setText("");
                  const { data } = await supabase()
                    .from("idea_comments")
                    .insert({ idea_id: idea.id, user_id: uid, nickname, body })
                    .select()
                    .single();
                  if (data) setComments((c) => (c.some((x) => x.id === data.id) ? c : [...c, data]));
                }}
              >
                <label className="sr-only" htmlFor={`cm-${idea.id}`}>
                  Comentario
                </label>
                <input id={`cm-${idea.id}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Opina o propone un cambio…" maxLength={400} />
                <button className="round-btn sm" aria-label="Enviar comentario" disabled={!text.trim()}>
                  <Send aria-hidden="true" />
                </button>
              </form>
            ) : (
              <p className="chat-locked">Entra para comentar.</p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/* ─────────────── Página ─────────────── */
export default function Comunidad() {
  const { user, profile, ready, signOut } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"new" | "top">("new");
  const [tab, setTab] = useState<"ideas" | "chat">("ideas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabase();
    sb.from("ideas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setIdeas(data ?? []);
        setLoading(false);
      });
    const ch = sb
      .channel("ideas")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, (p) => {
        if (p.eventType === "DELETE") setIdeas((x) => x.filter((i) => i.id !== (p.old as Idea).id));
        else {
          const n = p.new as Idea;
          setIdeas((x) => (x.some((i) => i.id === n.id) ? x.map((i) => (i.id === n.id ? n : i)) : [n, ...x]));
        }
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    if (!user) return setMyVotes(new Set());
    supabase()
      .from("idea_votes")
      .select("idea_id")
      .eq("user_id", user.id)
      .then(({ data }) => setMyVotes(new Set((data ?? []).map((v) => v.idea_id))));
  }, [user]);

  const sorted = useMemo(
    () => (sort === "top" ? [...ideas].sort((a, b) => b.votes_count - a.votes_count) : ideas),
    [ideas, sort]
  );

  const vote = async (idea: Idea) => {
    if (!user) return;
    const sb = supabase();
    const on = myVotes.has(idea.id);
    const next = new Set(myVotes);
    if (on) next.delete(idea.id);
    else next.add(idea.id);
    setMyVotes(next);
    setIdeas((x) => x.map((i) => (i.id === idea.id ? { ...i, votes_count: i.votes_count + (on ? -1 : 1) } : i)));
    const { error } = on
      ? await sb.from("idea_votes").delete().eq("idea_id", idea.id).eq("user_id", user.id)
      : await sb.from("idea_votes").insert({ idea_id: idea.id, user_id: user.id });
    if (error) {
      setMyVotes(myVotes);
      setIdeas((x) => x.map((i) => (i.id === idea.id ? idea : i)));
    }
  };

  return (
    <div className="page">
      <header className="page-hero compact">
        <h1 className="page-title">Comunidad</h1>
        <p className="page-lede">
          Comparte ideas de diseño, vota las de otros clientes y conversa con el taller. Las ideas más votadas pueden
          convertirse en diseños de la tienda.
        </p>
        {ready && user && (
          <p className="session-line">
            Entraste como <strong>{profile?.nickname}</strong>
            <button className="text-link" onClick={signOut}>
              <LogOut aria-hidden="true" /> Salir
            </button>
          </p>
        )}
      </header>

      <div className="seg" role="tablist" aria-label="Secciones de la comunidad">
        <button role="tab" aria-selected={tab === "ideas"} onClick={() => setTab("ideas")}>
          Ideas
        </button>
        <button role="tab" aria-selected={tab === "chat"} onClick={() => setTab("chat")}>
          Chat
        </button>
      </div>

      <div className={`community tab-${tab}`}>
        <section className="ideas" aria-labelledby="ideas-t">
          <div className="ideas-head">
            <h2 id="ideas-t">Muro de ideas</h2>
            <div className="sort" role="radiogroup" aria-label="Ordenar ideas">
              <button role="radio" aria-checked={sort === "new"} onClick={() => setSort("new")}>
                Nuevas
              </button>
              <button role="radio" aria-checked={sort === "top"} onClick={() => setSort("top")}>
                Más votadas
              </button>
            </div>
          </div>

          {ready && !user && <SignIn reason="Entra con tu correo para publicar ideas, votar, comentar y chatear." />}
          {user && profile && (
            <IdeaForm
              onSave={async (v) => {
                const { data, error } = await supabase()
                  .from("ideas")
                  .insert({ ...v, user_id: user.id, nickname: profile.nickname })
                  .select()
                  .single();
                if (error) return "No se pudo publicar. Intenta de nuevo.";
                setIdeas((x) => (x.some((i) => i.id === data.id) ? x : [data, ...x]));
                return null;
              }}
            />
          )}

          <ul className="idea-list">
            {loading && <li className="empty">Cargando ideas…</li>}
            {!loading && sorted.length === 0 && (
              <li className="empty">Aún no hay ideas. La primera que se publique queda arriba del muro.</li>
            )}
            {sorted.map((idea) => (
              <IdeaItem
                key={idea.id}
                idea={idea}
                uid={user?.id}
                nickname={profile?.nickname}
                voted={myVotes.has(idea.id)}
                onVote={() => vote(idea)}
                onUpdate={async (patch) => {
                  const { data, error } = await supabase().from("ideas").update(patch).eq("id", idea.id).select().single();
                  if (error) return "No se pudieron guardar los cambios.";
                  setIdeas((x) => x.map((i) => (i.id === idea.id ? data : i)));
                  return null;
                }}
                onDelete={async () => {
                  await supabase().from("ideas").delete().eq("id", idea.id);
                  setIdeas((x) => x.filter((i) => i.id !== idea.id));
                }}
              />
            ))}
          </ul>
        </section>

        <Chat uid={user?.id} nickname={profile?.nickname} />
      </div>
    </div>
  );
}
