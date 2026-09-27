"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  id: string;
  colorSlug: string;
  colorName: string;
  hex: string;
  designSlug: string;
  designName: string;
  logoUrl?: string | null;
  size: string;
  qty: number;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (lines: Omit<CartLine, "id">[]) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "bp-cart";
const sameItem = (a: Omit<CartLine, "id">, b: Omit<CartLine, "id">) =>
  a.colorSlug === b.colorSlug && a.designSlug === b.designSlug && a.size === b.size && (a.logoUrl ?? null) === (b.logoUrl ?? null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const add = useCallback((incoming: Omit<CartLine, "id">[]) => {
    setLines((cur) => {
      const next = [...cur];
      for (const l of incoming) {
        const i = next.findIndex((x) => sameItem(x, l));
        if (i >= 0) next[i] = { ...next[i], qty: Math.min(500, next[i].qty + l.qty) };
        else next.push({ ...l, id: crypto.randomUUID() });
      }
      return next;
    });
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) =>
      setLines((cur) => cur.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(500, qty)) } : l))),
    []
  );
  const remove = useCallback((id: string) => setLines((cur) => cur.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);
  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  return (
    <CartCtx.Provider value={{ lines, count, open, setOpen, add, setQty, remove, clear }}>{children}</CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart fuera de CartProvider");
  return c;
}
