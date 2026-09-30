"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "elite" | "juvenil";
export const THEMES: { id: Theme; label: string; hint: string }[] = [
  { id: "elite", label: "Élite", hint: "Estudio grafito, luz champán" },
  { id: "juvenil", label: "Juvenil", hint: "Lima ácido y libreas de carrera" },
];

/** La base de datos guarda el estilo del pedido como formal/informal. */
export const themeForOrders = (t: Theme) => (t === "elite" ? "formal" : "informal");

const isTheme = (v: unknown): v is Theme => v === "elite" || v === "juvenil";

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "elite",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("elite");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (isTheme(current)) setThemeState(current);
    else document.documentElement.dataset.theme = "elite";
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    root.classList.add("theme-shift");
    root.dataset.theme = t;
    try {
      localStorage.setItem("bp-theme", t);
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-shift"), 700);
  }, []);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

/* Migra los estilos anteriores: formal → élite, informal/teens → juvenil. */
export const themeBootScript = `try{var t=localStorage.getItem('bp-theme');if(t==='formal')t='elite';if(t==='informal'||t==='teens')t='juvenil';if(t==='elite'||t==='juvenil')document.documentElement.dataset.theme=t;}catch(e){}`;
