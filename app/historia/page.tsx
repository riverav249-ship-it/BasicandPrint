import type { Metadata } from "next";
import Link from "next/link";
import RegMark from "@/components/RegMark";
import Shirt from "@/components/Shirt";

export const metadata: Metadata = { title: "Nosotros" };

const VALUES = [
  { t: "Tinta que dura", d: "Imprimimos con tinta plástica curada al calor para que el diseño aguante las lavadas." },
  { t: "Te enseñamos antes", d: "Ves tu camiseta armada en la página y te confirmamos todo por WhatsApp antes de imprimir." },
  { t: "De uno a cientos", d: "Una camiseta para regalar o el uniforme de toda tu empresa, con el mismo cuidado." },
];

export default function Historia() {
  return (
    <div className="page">
      <header className="page-hero story-hero">
        <div>
          <h1 className="page-title">
            Dos hermanas,
            <br />
            un taller de tinta.
          </h1>
          <p className="page-lede">
            Basic&amp;Print nace en El Salvador de la unión de dos hermanas que decidieron convertir las ganas de crear en un
            negocio propio: camisetas con serigrafía hechas a la medida de cada cliente.
          </p>
        </div>
        <div className="story-shirts" aria-hidden="true">
          <Shirt color="#F2C230" design="torogoz" className="s1" />
          <Shirt color="#1E2A4A" design="volcan" className="s2" />
          <Shirt color="#C62A2F" design="maquilishuat" className="s3" />
        </div>
      </header>

      <section className="band story" aria-labelledby="que-es">
        <h2 id="que-es" className="band-title">
          ¿Qué es la serigrafía?
        </h2>
        <div className="story-cols">
          <p>
            Es una técnica de impresión en la que la tinta pasa a través de una malla muy fina tensada en un marco. La malla
            se cubre con una emulsión y se “quema” con luz: donde está el diseño, la malla queda abierta y deja pasar la tinta.
          </p>
          <p>
            Cada color del diseño lleva su propia pantalla. Con el rasero se jala la tinta sobre la camiseta, color por color,
            y al final se cura con calor para que quede fija. Por eso un diseño de “2 tintas” usa dos pantallas.
          </p>
        </div>
      </section>

      <section className="band values" aria-labelledby="como-trabajamos">
        <h2 id="como-trabajamos" className="band-title">
          Cómo trabajamos
        </h2>
        <ul className="values-list">
          {VALUES.map((v) => (
            <li key={v.t}>
              <RegMark />
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="band invite" aria-labelledby="arma">
        <div>
          <h2 id="arma" className="band-title">
            Arma la tuya
          </h2>
          <p>Elige color, diseño y talla en el configurador de la página de inicio.</p>
        </div>
        <div className="invite-actions">
          <Link className="squeegee" href="/">
            <span>Ir al configurador</span>
          </Link>
          <Link className="text-link" href="/contacto">
            Escríbenos
          </Link>
        </div>
      </section>
    </div>
  );
}
