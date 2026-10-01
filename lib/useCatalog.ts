"use client";
import { useEffect, useState } from "react";
import { FALLBACK_COLORS, supabase, type ShirtColor } from "./supabase";

let colorsCache: Promise<ShirtColor[]> | null = null;

/** Colores activos del catálogo (con foto). Mientras carga, usa los colores de respaldo. */
export function useShirtColors() {
  const [colors, setColors] = useState<ShirtColor[]>(FALLBACK_COLORS);
  useEffect(() => {
    colorsCache ??= Promise.resolve(
      supabase()
        .from("shirt_colors")
        .select("slug,name,hex,image_url")
        .eq("active", true)
        .order("sort")
        .then(({ data }) => (data?.length ? (data as ShirtColor[]) : FALLBACK_COLORS))
    ).catch(() => FALLBACK_COLORS);
    let alive = true;
    colorsCache.then((c) => alive && setColors(c));
    return () => {
      alive = false;
    };
  }, []);
  return colors;
}
