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

export type { ShirtColor } from "./constants";
export type Design = {
  slug: string;
  name: string;
  category: string;
  ink_note: string | null;
  is_sample: boolean;
  image_url?: string | null;
};

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

export { FALLBACK_COLORS, WHATSAPP, whatsappLink } from "./constants";
