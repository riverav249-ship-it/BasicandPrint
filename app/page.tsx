import Link from "next/link";
import { ArrowRight, Check, Droplet, PenLine, Shirt as ShirtIcon, Truck } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
import QuickDesigner from "@/components/home/QuickDesigner";
import { whatsappLink } from "@/lib/constants";

const FEATURES = [
  { Icon: ShirtIcon, t: "Camisetas básicas de calidad" },
  { Icon: PenLine, t: "Diseña o sube tu propio diseño" },
  { Icon: Droplet, t: "Prueba con varios colores de camisa" },
  { Icon: Truck, t: "Envíos a todo El Salvador" },
];

const CHECKS = [
  "Sube tu propio diseño",
  "Elige el color y la talla de tu camiseta",
  "Añade texto, imágenes o logotipos",
  "Mira el resultado antes de imprimir",
];

/* Fotos de las tarjetas: provisionales, tomadas del diseño de referencia. Reemplazar por fotos reales del taller y clientes. */
const Photo = (src: string) =>
  function CardPhoto() {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="cat-photo" src={src} alt="" loading="lazy" decoding="async" />;
  };
const Basicas = Photo("/inicio/basicas.webp");
const Serigrafia = Photo("/inicio/serigrafia.webp");
const Empresas = Photo("/inicio/empresas.webp");
const Eventos = Photo("/inicio/eventos.webp");

const CATS = [
  { t: "Camisetas básicas", d: "Colores y tallas para todos", href: "/disenar", Art: Basicas },
  { t: "Serigrafía", d: "Diseños que perduran", href: "/historia", Art: Serigrafia },
  {
    t: "Para empresas",
    d: "Uniformes y promociones",
    href: whatsappLink("Hola Basic&Print, quiero cotizar camisetas con el logo de mi empresa."),
    Art: Empresas,
    external: true,
  },
  {
    t: "Para eventos",
    d: "Cumpleaños, graduaciones y más",
    href: whatsappLink("Hola Basic&Print, quiero cotizar camisetas para un evento."),
    Art: Eventos,
    external: true,
  },
];

export default function Home() {
  return (
    <>
      <section className="h-hero" aria-labelledby="h-titulo">
        <div className="h-hero-copy">
          <p className="h-eyebrow">Camisetas básicas y personalizadas</p>
          <h1 id="h-titulo" className="h-title">
            Tu idea,
            <span>en una camiseta</span>
          </h1>
          <p className="h-lead">
            En nuestra tienda puedes <strong>comprar camisetas básicas</strong> de buena calidad o personalizarlas con el diseño que
            quieras. Tú imaginas, nosotros lo imprimimos.
          </p>
          <ul className="h-features">
            {FEATURES.map(({ Icon, t }) => (
              <li key={t}>
                <Icon aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <Link className="h-cta" href="/disenar">
            Diseña tu camisa ahora <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <HeroCarousel />
      </section>

      <section className="h-make" aria-labelledby="h-unica">
        <div className="h-make-copy">
          <p className="h-eyebrow dark">Diseña tu camisa en línea</p>
          <h2 id="h-unica">Hazla única</h2>
          <p>
            Personaliza tu camiseta aquí mismo: sube tu imagen, escribe tu frase o elige un diseño, cambia el color y mira el
            resultado al instante.
          </p>
          <ul className="h-checks">
            {CHECKS.map((c) => (
              <li key={c}>
                <Check aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
          <Link className="h-cta-outline" href="/disenar">
            Comienza a diseñar <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <QuickDesigner />
      </section>

      <section className="h-cats" aria-label="Lo que hacemos">
        {CATS.map(({ t, d, href, Art, external }) => (
          <Link
            key={t}
            href={href}
            className="cat-card"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Art />
            <span className="cat-text">
              <strong>{t}</strong>
              <span>{d}</span>
            </span>
            <span className="cat-go" aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
