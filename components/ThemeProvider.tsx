"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "formal" | "informal";
export const THEMES: { id: Theme; label: string; hint: string }[] = [
  { id: "formal", label: "Formal", hint: "Minimalista" },
  { id: "informal", label: "Informal", hint: "Celeste y azul" },
];

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "informal",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("informal");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "formal" || current === "informal") setThemeState(current);
    else document.documentElement.dataset.theme = "informal";
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    root.classList.add("theme-shift");
    root.dataset.theme = t;
    try {
      localStorage.setItem("bp-theme", t);
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-shift"), 600);
  }, []);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

export const themeBootScript = `try{var t=localStorage.getItem('bp-theme');if(t==='formal'||t==='informal')document.documentElement.dataset.theme=t;}catch(e){}`;
