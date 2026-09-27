import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "@fontsource/big-shoulders-display/latin-800";
import "@fontsource/big-shoulders-display/latin-900";
import "@fontsource/bodoni-moda/latin-700.css";
import "@fontsource/bodoni-moda/latin-700-italic.css";
import "@fontsource/bungee/latin-400.css";
import "./globals.css";
import { ThemeProvider, themeBootScript } from "@/components/ThemeProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: { default: "Basic&Print · Serigrafía en camisetas", template: "%s · Basic&Print" },
  description:
    "Arma tu camiseta con serigrafía: elige el color, el diseño y la talla, y pídela por WhatsApp. El Salvador.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="informal"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip" href="#contenido">
            Saltar al contenido
          </a>
          <SiteHeader />
          <main id="contenido">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
