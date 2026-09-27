"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Flame, Gift, AlertCircle } from "lucide-react";
import SignIn from "@/components/SignIn";
import RegMark from "@/components/RegMark";
import { useAuth } from "@/lib/useAuth";
import { supabase, whatsappLink } from "@/lib/supabase";

type Promo = { id: string; title: string; description: string | null; badge: string | null; code: string | null; ends_at: string | null; is_sample: boolean };
type Challenge = { id: string; slug: string; title: string; description: string | null; goal_days: number; prize: string; is_sample: boolean };
type Streak = { challenge_id: string; streak: number; checked_today: boolean };

function Punchcard({ goal, streak }: { goal: number; streak: number }) {
  const cells = Math.min(goal, 30);
  const filled = Math.min(streak, goal);
  return (
    <ol className={`punchcard ${cells > 10 ? "dense" : ""}`} aria-label={`${filled} de ${goal} días`}>
      {Array.from({ length: cells }, (_, i) => (
        <li key={i} className={i < filled ? "is-inked" : ""} style={{ ["--d" as string]: `${i * 40}ms` }}>
          <span className="sr-only">Día {i + 1}</span>
          <span aria-hidden="true">{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Promociones() {
  const { user, ready } = useAuth();
  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const sb = supabase();
    sb.from("promotions").select("*").order("sort").then(({ data }) => setPromos(data ?? []));
    sb.from("challenges").select("*").order("sort").then(({ data }) => setChallenges(data ?? []));
  }, []);

  const loadStreaks = useCallback(async () => {
    if (!user) return setStreaks({});
    const { data } = await supabase().rpc("my_streaks");
    const map: Record<string, Streak> = {};
    (data as Streak[] | null)?.forEach((s) => (map[s.challenge_id] = s));
    setStreaks(map);
  }, [user]);

  useEffect(() => {
    loadStreaks();
  }, [loadStreaks]);

  const checkIn = async (c: Challenge) => {
    if (!user) return;
    setBusy(c.id);
    setErr("");
    const { error } = await supabase().from("checkins").insert({ user_id: user.id, challenge_id: c.id });
    setBusy(null);
    if (error && error.code !== "23505") setErr("No pudimos marcar tu día. Intenta de nuevo.");
    loadStreaks();
  };

  return (
    <div className="page">
      <header className="page-hero compact">
        <h1 className="page-title">Promos y rachas</h1>
        <p className="page-lede">Ofertas del taller y retos diarios: marca tu día, no rompas la racha y gana premios.</p>
      </header>

      <section className="band promos" aria-labelledby="promos-t">
        <h2 id="promos-t" className="band-title">
          Promociones
        </h2>
        {promos === null && <p className="empty">Cargando promociones…</p>}
        {promos?.length === 0 && <p className="empty">No hay promociones activas en este momento. Vuelve pronto.</p>}
        <ul className="promo-list">
          {promos?.map((p, i) => (
            <li key={p.id} className={`promo ink-${i % 3}`}>
              <RegMark className="corner tl" />
              <RegMark className="corner br" />
              {p.badge && <p className="promo-badge">{p.badge}</p>}
              <h3>{p.title}</h3>
              {p.description && <p>{p.description}</p>}
              {p.code && (
                <p className="promo-code">
                  Código: <strong>{p.code}</strong>
                </p>
              )}
              {p.ends_at && <p className="promo-end">Válida hasta el {new Date(p.ends_at + "T12:00").toLocaleDateString("es-SV", { day: "numeric", month: "long" })}</p>}
              <a className="text-link" href={whatsappLink(`Hola Basic&Print, me interesa la promoción: ${p.title}`)} target="_blank" rel="noopener noreferrer">
                Preguntar por WhatsApp
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="band streaks" aria-labelledby="rachas-t">
        <h2 id="rachas-t" className="band-title">
          Retos de racha
        </h2>
        <p className="band-lede">Entra cada día y marca tu día en la hoja de registro. Si faltas un día, la racha vuelve a cero.</p>
        {ready && !user && <SignIn reason="Entra con tu correo para empezar tu racha. Tu progreso queda guardado en tu cuenta." />}
        {err && (
          <p className="form-error" role="alert">
            <AlertCircle aria-hidden="true" /> {err}
          </p>
        )}
        {challenges === null && <p className="empty">Cargando retos…</p>}
        <ul className="challenge-list">
          {challenges?.map((c) => {
            const s = streaks[c.id];
            const streak = s?.streak ?? 0;
            const done = streak >= c.goal_days;
            return (
              <li key={c.id} className="challenge">
                <div className="challenge-head">
                  <div>
                    <h3>{c.title}</h3>
                    {c.description && <p>{c.description}</p>}
                  </div>
                  <p className="streak-count" aria-label={`Racha actual: ${streak} días`}>
                    <Flame aria-hidden="true" />
                    <strong>{streak}</strong>
                    <span>/ {c.goal_days}</span>
                  </p>
                </div>
                <Punchcard goal={c.goal_days} streak={streak} />
                {c.goal_days > 30 && <p className="fine">Se muestran los primeros 30 días.</p>}
                <p className="prize">
                  <Gift aria-hidden="true" /> {c.prize}
                </p>
                {user &&
                  (done ? (
                    <p className="form-ok">
                      <Check aria-hidden="true" /> ¡Completaste el reto! Escríbenos para reclamar tu premio.{" "}
                      <a href={whatsappLink(`Hola Basic&Print, completé el reto "${c.title}".`)} target="_blank" rel="noopener noreferrer">
                        Reclamar
                      </a>
                    </p>
                  ) : s?.checked_today ? (
                    <p className="form-ok">
                      <Check aria-hidden="true" /> Día marcado. Vuelve mañana para seguir la racha.
                    </p>
                  ) : (
                    <button className="squeegee" onClick={() => checkIn(c)} disabled={busy === c.id}>
                      <span>{busy === c.id ? "Marcando…" : "Marcar mi día"}</span>
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
        <p className="fine">
          Los premios marcados como “ejemplo” son muestras. Consulta las bases con el taller.{" "}
          <Link href="/contacto">Contacto</Link>
        </p>
      </section>
    </div>
  );
}
