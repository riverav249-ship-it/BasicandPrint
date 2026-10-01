// Precios por camiseta. Se editan en el panel (Ajustes); estos son los valores de respaldo.
export type Prices = {
  basic: number; // básica sin estampado, 1–9
  basicPack: number; // básica, desde `packMin`
  print: number; // con serigrafía, 1–9
  printPack: number; // con serigrafía, desde `packMin`
  packMin: number;
};

export const DEFAULT_PRICES: Prices = { basic: 8, basicPack: 6, print: 12, printPack: 10, packMin: 10 };

const num = (v: string | undefined, d: number) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : d;
};

/** Lee los precios guardados en la tabla settings (claves price_*). */
export function pricesFromSettings(s: Record<string, string>): Prices {
  return {
    basic: num(s.price_basic, DEFAULT_PRICES.basic),
    basicPack: num(s.price_basic_pack, DEFAULT_PRICES.basicPack),
    print: num(s.price_print, DEFAULT_PRICES.print),
    printPack: num(s.price_print_pack, DEFAULT_PRICES.printPack),
    packMin: Math.round(num(s.price_pack_min, DEFAULT_PRICES.packMin)),
  };
}

export const money = (n: number) => `$${n.toFixed(2)}`;

/** Una línea es "básica" cuando no lleva estampado. */
export const BASIC_SLUG = "basica";
export const isPrinted = (l: { designSlug: string; printed?: boolean }) => l.printed ?? l.designSlug !== BASIC_SLUG;

export function unitPrice(printed: boolean, qtyOfThatKind: number, p: Prices) {
  const pack = qtyOfThatKind >= p.packMin;
  return printed ? (pack ? p.printPack : p.print) : pack ? p.basicPack : p.basic;
}

/** Calcula el total del carrito. El precio de paquete se aplica por tipo (básicas / con serigrafía) sumando todas sus tallas y colores. */
export function quote<L extends { qty: number; designSlug: string; printed?: boolean }>(lines: L[], p: Prices) {
  const qtyPrinted = lines.filter(isPrinted).reduce((s, l) => s + l.qty, 0);
  const qtyBasic = lines.filter((l) => !isPrinted(l)).reduce((s, l) => s + l.qty, 0);
  const rows = lines.map((l) => {
    const printed = isPrinted(l);
    const unit = unitPrice(printed, printed ? qtyPrinted : qtyBasic, p);
    return { line: l, printed, unit, total: unit * l.qty };
  });
  const total = rows.reduce((s, r) => s + r.total, 0);
  const regular = qtyPrinted * p.print + qtyBasic * p.basic;
  const missing = (q: number) => (q > 0 && q < p.packMin ? p.packMin - q : 0);
  return {
    rows,
    total,
    savings: regular - total,
    qtyPrinted,
    qtyBasic,
    missingPrinted: missing(qtyPrinted),
    missingBasic: missing(qtyBasic),
  };
}
