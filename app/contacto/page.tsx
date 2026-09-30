"use client";
import { useState } from "react";
import { MessageCircle, Mail, Check, AlertCircle } from "lucide-react";
import RegMark from "@/components/RegMark";
import SocialLinks from "@/components/SocialLinks";
import { supabase, whatsappLink, WHATSAPP } from "@/lib/supabase";

const FAQ = [
  {
    q: "¿Puedo pedir colores y tallas diferentes en un mismo pedido?",
    a: "Sí. En el taller eliges color, diseño y texto, marcas cuántas quieres de cada talla y las agregas a tu pedido. Repite con otro color o diseño y envías todo junto.",
  },
  {
    q: "¿Qué archivo necesito para imprimir mi logo?",
    a: "Sube una imagen PNG, JPG, SVG o WEBP de hasta 5 MB. Para mejor resultado usa PNG con fondo transparente o SVG. Si tu archivo no está listo, escríbenos y lo revisamos contigo.",
  },
  {
    q: "¿Dónde puede ir la impresión?",
    a: "En el frente, pequeño en el pecho o en la espalda. Si quieres más de un lugar, anótalo en las notas del pedido.",
  },
  {
    q: "¿Cómo sé el precio y cuándo está listo?",
    a: "Cuando envías el pedido por WhatsApp te respondemos con el precio, la forma de pago y el tiempo de entrega según la cantidad y los colores de tinta.",
  },
  {
    q: "¿Qué talla escojo?",
    a: "Mide de axila a axila una camiseta que te quede bien y compárala con la tabla que te enviamos por WhatsApp. Si dudas, pregúntanos antes de confirmar.",
  },
  {
    q: "¿Me muestran cómo quedará antes de imprimir?",
    a: "Sí, confirmamos contigo el diseño, la ubicación y los colores antes de preparar las pantallas.",
  },
];

const TOPICS = [
  { v: "pedido", l: "Un pedido" },
  { v: "empresa", l: "Uniformes para empresa" },
  { v: "colegio", l: "Colegio o promoción" },
  { v: "evento", l: "Evento o grupo" },
  { v: "otro", l: "Otra cosa" },
];

export default function Contacto() {
  const [f, setF] = useState({ name: "", email: "", phone: "", topic: "pedido", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.name.trim().length < 2) return setErr("Escribe tu nombre.");
    if (!f.email.trim() && f.phone.replace(/\D/g, "").length < 8) return setErr("Déjanos un correo o un teléfono para responderte.");
    if (f.message.trim().length < 5) return setErr("Cuéntanos un poco más en el mensaje.");
    setState("sending");
    const { error } = await supabase()
      .from("contact_messages")
      .insert({
        name: f.name.trim(),
        email: f.email.trim() || null,
        phone: f.phone.trim() || null,
        topic: f.topic,
        message: f.message.trim(),
      });
    if (error) {
      setState("error");
      setErr("No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.");
    } else setState("sent");
  };

  return (
    <div className="page">
      <header className="page-hero compact">
        <h1 className="page-title">Contacto</h1>
        <p className="page-lede">Cotizaciones, pedidos grandes o dudas: la forma más rápida es WhatsApp.</p>
      </header>

      <div className="contact-grid">
        <aside className="contact-direct">
          <a className="squeegee" href={whatsappLink("Hola Basic&Print, quiero información.")} target="_blank" rel="noopener noreferrer">
            <span>
              <MessageCircle aria-hidden="true" /> Escribir por WhatsApp
            </span>
          </a>
          {!WHATSAPP && <p className="dev-note">Falta configurar el número de WhatsApp del negocio.</p>}
          <SocialLinks />
          <dl className="contact-facts">
            <div>
              <dt>Dónde estamos</dt>
              <dd>El Salvador</dd>
            </div>
            <div>
              <dt>Qué imprimimos</dt>
              <dd>Camisetas con serigrafía, de una pieza a pedidos por volumen.</dd>
            </div>
          </dl>
        </aside>

        {state === "sent" ? (
          <div className="contact-form sent" role="status">
            <RegMark className="corner tl" />
            <Check aria-hidden="true" />
            <h2>Mensaje recibido</h2>
            <p>Gracias, {f.name.split(" ")[0]}. Te respondemos lo antes posible.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            <RegMark className="corner tl" />
            <RegMark className="corner br" />
            <h2>
              <Mail aria-hidden="true" /> Déjanos un mensaje
            </h2>
            <label>
              Nombre
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" maxLength={80} />
            </label>
            <div className="two">
              <label>
                Correo
                <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" maxLength={120} />
              </label>
              <label>
                Teléfono
                <input inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" maxLength={20} />
              </label>
            </div>
            <fieldset className="topic-pick">
              <legend>¿Sobre qué nos escribes?</legend>
              {TOPICS.map((t) => (
                <label key={t.v}>
                  <input type="radio" name="topic" checked={f.topic === t.v} onChange={() => setF({ ...f, topic: t.v })} />
                  <span>{t.l}</span>
                </label>
              ))}
            </fieldset>
            <label>
              Mensaje
              <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} rows={5} maxLength={1500} />
            </label>
            {err && (
              <p className="form-error" role="alert">
                <AlertCircle aria-hidden="true" /> {err}
              </p>
            )}
            <button className="squeegee" disabled={state === "sending"}>
              <span>{state === "sending" ? "Enviando…" : "Enviar mensaje"}</span>
            </button>
          </form>
        )}
      </div>
      <section className="band" aria-labelledby="faq-t">
        <h2 id="faq-t" className="band-title">
          Preguntas frecuentes
        </h2>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
