"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Settings = Record<string, string>;
let cache: Promise<Settings> | null = null;

export function loadSettings(force = false): Promise<Settings> {
  if (!cache || force) {
    cache = Promise.resolve(
      supabase()
        .from("settings")
        .select("key,value")
        .then(({ data }) => Object.fromEntries((data ?? []).map((r) => [r.key, r.value])))
    );
  }
  return cache;
}

export function useSettings() {
  const [s, setS] = useState<Settings>({});
  useEffect(() => {
    loadSettings().then(setS);
  }, []);
  return s;
}

/** Convierte "@usuario" o "usuario" o una URL en enlace completo de cada red. */
export function socialUrl(kind: "facebook" | "instagram" | "tiktok", raw?: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, "").replace(/^(www\.)?(facebook|instagram|tiktok)\.com\/@?/i, "");
  if (kind === "facebook") return `https://facebook.com/${h}`;
  if (kind === "instagram") return `https://instagram.com/${h}`;
  return `https://www.tiktok.com/@${h}`;
}
