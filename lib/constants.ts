// Datos compartidos entre servidor y navegador (sin "use client").

export type ShirtColor = { slug: string; name: string; hex: string; image_url?: string | null };

export const FALLBACK_COLORS: ShirtColor[] = [
  { slug: "blanco", name: "Blanco", hex: "#F2F2EF", image_url: "/catalogo/camisetas/blanco.webp" },
  { slug: "negro", name: "Negro", hex: "#131416", image_url: "/catalogo/camisetas/negro.webp" },
  { slug: "marino", name: "Azul marino", hex: "#2B364A", image_url: "/catalogo/camisetas/marino.webp" },
  { slug: "rojo", name: "Rojo", hex: "#B91A26", image_url: "/catalogo/camisetas/rojo.webp" },
  { slug: "royal", name: "Azul royal", hex: "#2158B5", image_url: "/catalogo/camisetas/royal.webp" },
  { slug: "verde-olivo", name: "Verde olivo", hex: "#777949", image_url: "/catalogo/camisetas/verde-olivo.webp" },
  { slug: "amarillo", name: "Amarillo", hex: "#F2C230", image_url: "/catalogo/camisetas/amarillo.webp" },
  { slug: "gris", name: "Gris jaspe", hex: "#989693", image_url: "/catalogo/camisetas/gris.webp" },
  { slug: "morado", name: "Morado", hex: "#7C509E", image_url: "/catalogo/camisetas/morado.webp" },
  { slug: "rosado", name: "Rosado", hex: "#F0CBC3", image_url: "/catalogo/camisetas/rosado.webp" },
];

export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "50376377821").replace(/\D/g, "");

export function whatsappLink(text: string) {
  const base = WHATSAPP ? `https://wa.me/${WHATSAPP}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
