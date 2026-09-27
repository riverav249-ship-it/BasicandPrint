import Link from "next/link";
import Builder from "@/components/Builder";
import RegMark from "@/components/RegMark";

const FOR_WHO = [
  { t: "Para ti o para regalar", d: "Una sola camiseta con el diseño que te gusta, o una sorpresa para alguien especial." },
  { t: "Empresas y uniformes", d: "Tu logo impreso igual en todas las camisetas de tu equipo." },
  { t: "Colegios y promociones", d: "Graduaciones, promociones y eventos con diseño propio." },
  { t: "Grupos y eventos", d: "Familias, iglesias, equipos deportivos y excursiones." },
];

const STEPS = [
  { t: "Eliges", d: "Color, diseño, talla y cantidad aquí mismo." },
  { t: "Confirmamos", d: "Te escribimos por WhatsApp con precio y fecha." },
  { t: "Quemamos la pantalla", d: "Preparamos un marco por cada tinta de tu diseño." },
  { t: "Imprimimos", d: "Tinta por tinta, con el rasero, y curamos al calor." },
];

export default function Home() {
  return (
    <>
      <Builder />

      <section className="band for-who" aria-labelledby="para-quien">
        <h2 id="para-quien" className="band-title">
          Imprimimos para
        </h2>
        <ul className="who-list">
          {FOR_WHO.map((w) => (
            <li key={w.t}>
              <h3>{w.t}</h3>
              <p>{w.d}</p>
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
              <RegMark />
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
