import Link from "next/link";
import RegMark from "./RegMark";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-mark">
        <RegMark />
        <p>
          Basic<em>&amp;</em>Print
        </p>
      </div>
      <p className="footer-line">Serigrafía en camisetas · El Salvador</p>
      <nav aria-label="Pie de página">
        <Link href="/historia">Nosotros</Link>
        <Link href="/comunidad">Comunidad</Link>
        <Link href="/promociones">Promos y rachas</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>
      <p className="footer-fine">Los diseños y premios marcados como “ejemplo” son muestras del sitio.</p>
    </footer>
  );
}
