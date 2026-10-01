import Link from "next/link";
import { ArrowRight, Check, Droplet, PenLine, Shirt as ShirtIcon, Truck } from "lucide-react";
import Shirt from "@/components/Shirt";
import HeroCarousel from "@/components/home/HeroCarousel";
import QuickDesigner from "@/components/home/QuickDesigner";
import { FALLBACK_COLORS, whatsappLink } from "@/lib/constants";

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

const photo = (slug: string) => FALLBACK_COLORS.find((c) => c.slug === slug)!;

function Basicas() {
  const row = ["negro", "blanco", "gris", "marino"].map(photo);
  return (
    <div className="cat-art cat-basicas" aria-hidden="true">
      {row.map((c, i) => (
        <Shirt key={c.slug} color={c.hex} photo={c.image_url} className={`cat-tee t${i}`} />
      ))}
    </div>
  );
}

function Serigrafia() {
  return (
    <svg className="cat-art cat-screen" viewBox="0 0 320 200" aria-hidden="true">
      <rect x="40" y="34" width="240" height="140" rx="6" fill="#2a2d33" />
      <rect x="54" y="48" width="212" height="112" fill="#e9edf2" />
      <path d="M54 48 H266 V160 H54 Z" fill="url(#mallaSeri)" opacity="0.5" />
      <path d="M70 120 C 120 96, 190 140, 252 108 L 252 160 L 70 160 Z" fill="#ffd23f" />
      <rect x="98" y="96" width="150" height="16" rx="3" fill="#111" transform="rotate(-8 170 104)" />
      <rect x="160" y="70" width="26" height="34" rx="4" fill="#3a3d44" transform="rotate(-8 170 104)" />
      <defs>
        <pattern id="mallaSeri" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 0 H6 M0 0 V6" stroke="#b8c0cc" strokeWidth="0.6" />
        </pattern>
      </defs>
    </svg>
  );
}

function Empresas() {
  const c = photo("negro");
  return (
    <div className="cat-art cat-solo" aria-hidden="true">
      <Shirt color={c.hex} photo={c.image_url} design="volcan" className="cat-tee" />
    </div>
  );
}

function Eventos() {
  const trio = [
    { c: photo("negro"), d: "olas" },
    { c: photo("blanco"), d: "promo" },
    { c: photo("negro"), d: "maquilishuat" },
  ];
  return (
    <div className="cat-art cat-trio" aria-hidden="true">
      {trio.map(({ c, d }, i) => (
        <Shirt key={i} color={c.hex} photo={c.image_url} design={d} className={`cat-tee t${i}`} />
      ))}
    </div>
  );
}

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
