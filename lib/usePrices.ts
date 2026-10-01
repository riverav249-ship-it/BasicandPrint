"use client";
import { useSettings } from "./settings";
import { pricesFromSettings } from "./pricing";

/** Precios vigentes (desde el panel; usa los de respaldo mientras carga). */
export function usePrices() {
  return pricesFromSettings(useSettings());
}
