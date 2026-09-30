import Link from "next/link";
import Builder from "@/components/Builder";
import Shirt from "@/components/Shirt";

const FOR_WHO = [
  {
    t: "Para ti o para regalar",
    d: "Una sola camiseta con el diseño que te gusta, o una sorpresa para alguien especial.",
    hex: "#F4F4F2",
    design: "torogoz",
    href: "/?color=blanco&diseno=torogoz",
  },
  {
    t: "Empresas y uniformes",
    d: "Tu logo impreso igual en todas las camisetas de tu equipo.",
    hex: "#1E2A4A",
    design: "tu-logo",
    href: "/?color=marino&diseno=tu-logo",
  },
  {
    t: "Colegios y promociones",
    d: "Graduaciones, promociones y eventos con diseño propio.",
    hex: "#2450B8",
    design: "promo",
    href: "/?color=royal&diseno=promo",
  },
  {
    t: "Grupos y eventos",
    d: "Familias, iglesias, equipos deportivos y excursiones.",
    hex: "#C62A2F",
    design: "volcan",
    href: "/?color=rojo&diseno=volcan",
  },
];

const STEPS = [
  { t: "Configuras", d: "Color, diseño, talla y cantidad aquí mismo." },
  { t: "Confirmamos", d: "Te escribimos por WhatsApp con precio y fecha." },
  { t: "Preparamos la pantalla", d: "Un marco por cada tinta de tu diseño." },
  { t: "Imprimimos", d: "Tinta por tinta, y curamos al calor para que dure." },
];

export default function Home() {
  return (
    <>
      <Builder />

      <section className="band lineup" aria-labelledby="para-quien">
        <h2 id="para-quien" className="band-title">
          Imprimimos para
        </h2>
        <ul className="lineup-list">
          {FOR_WHO.map((w) => (
            <li key={w.t}>
              <a href={w.href} className="lineup-item">
                <span className="lineup-stage" aria-hidden="true">
                  <Shirt color={w.hex} design={w.design} className="lineup-shirt" />
                </span>
                <h3>{w.t}</h3>
                <p>{w.d}</p>
                <span className="lineup-go">Configurar este ejemplo</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="band process" aria-labelledby="como">
        <h2 id="como" className="band-title">
          Del pedido a tu camiseta
        </h2>
        <ol className="process-line">
          {STEPS.map((s) => (
            <li key={s.t}>
              <span className="process-node" aria-hidden="true" />
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="band invite" aria-labelledby="invita">
        <div>
          <h2 id="invita" className="band-title">
            ¿Tienes una idea de diseño?
          </h2>
          <p>Compártela en la comunidad, recibe votos de otros clientes y mantén tu racha para ganar premios.</p>
        </div>
        <div className="invite-actions">
          <Link className="squeegee" href="/comunidad">
            <span>Ir a la comunidad</span>
          </Link>
          <Link className="text-link" href="/promociones">
            Ver promos y rachas
          </Link>
        </div>
      </section>
    </>
  );
}
