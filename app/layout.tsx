import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/archivo/wdth-italic.css";
import "@fontsource/bungee/latin-400.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/CartDrawer";
import { ShirtDefs } from "@/components/Shirt";
import { CartProvider } from "@/lib/cart";

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
      data-theme="elite"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <CartProvider>
          <ShirtDefs />
          <a className="skip" href="#contenido">
            Saltar al contenido
          </a>
          <SiteHeader />
          <main id="contenido">{children}</main>
          <SiteFooter />
          <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
