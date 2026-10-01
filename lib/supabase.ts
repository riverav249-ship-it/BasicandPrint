"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Valores públicos del proyecto (seguros para el navegador; la seguridad la dan las reglas RLS).
const PUBLIC_SUPABASE_URL = "https://atgmxwccddbkkulfqyaf.supabase.co";
const PUBLIC_SUPABASE_KEY = "sb_publishable_q1qDacd_7WCzRI9WjiWWFQ_PqGC38wc";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_KEY,
      { auth: { persistSession: true, detectSessionInUrl: true, flowType: "implicit" } }
    );
  }
  return client;
}

export type ShirtColor = { slug: string; name: string; hex: string; image_url?: string | null };
export type Design = {
  slug: string;
  name: string;
  category: string;
  ink_note: string | null;
  is_sample: boolean;
  image_url?: string | null;
};

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

export const FALLBACK_DESIGNS: Design[] = [
  { slug: "torogoz", name: "Torogoz", category: "El Salvador", ink_note: "3 tintas", is_sample: true },
  { slug: "volcan", name: "Volcán", category: "El Salvador", ink_note: "2 tintas", is_sample: true },
  { slug: "maquilishuat", name: "Maquilishuat", category: "El Salvador", ink_note: "2 tintas", is_sample: true },
  { slug: "olas", name: "Olas del Pacífico", category: "Playa", ink_note: "2 tintas", is_sample: true },
  { slug: "cafe", name: "Café de altura", category: "Sabores", ink_note: "2 tintas", is_sample: true },
  { slug: "pupusa", name: "Pupusa Power", category: "Sabores", ink_note: "3 tintas", is_sample: true },
  { slug: "tu-logo", name: "Tu logo aquí", category: "Empresas", ink_note: "según tu arte", is_sample: true },
  { slug: "promo", name: "Promo 2027", category: "Colegios", ink_note: "2 tintas", is_sample: true },
];

export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "50376377821").replace(/\D/g, "");

export function whatsappLink(text: string) {
  const base = WHATSAPP ? `https://wa.me/${WHATSAPP}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
