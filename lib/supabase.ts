"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, detectSessionInUrl: true, flowType: "implicit" } }
    );
  }
  return client;
}

export type ShirtColor = { slug: string; name: string; hex: string };
export type Design = { slug: string; name: string; category: string; ink_note: string | null; is_sample: boolean };

export const FALLBACK_COLORS: ShirtColor[] = [
  { slug: "blanco", name: "Blanco", hex: "#F4F4F2" },
  { slug: "negro", name: "Negro", hex: "#1A1A1C" },
  { slug: "marino", name: "Azul marino", hex: "#1E2A4A" },
  { slug: "rojo", name: "Rojo", hex: "#C62A2F" },
  { slug: "royal", name: "Azul royal", hex: "#2450B8" },
  { slug: "verde", name: "Verde bosque", hex: "#1F5A3C" },
  { slug: "amarillo", name: "Amarillo", hex: "#F2C230" },
  { slug: "gris", name: "Gris jaspe", hex: "#9A9CA0" },
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

export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, "");

export function whatsappLink(text: string) {
  const base = WHATSAPP ? `https://wa.me/${WHATSAPP}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
