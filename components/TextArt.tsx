/** Texto del cliente acomodado en hasta 3 líneas dentro del lienzo de 200×200. */
export default function TextArt({ text, color }: { text: string; color: string }) {
  const words = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= 10) lines[lines.length - 1] = last + " " + w;
    else lines.push(w);
  }
  const shown = lines.slice(0, 3);
  const longest = Math.max(1, ...shown.map((l) => l.length));
  const size = Math.min(58, 300 / longest);
  const top = 100 - ((shown.length - 1) * size * 0.95) / 2 + size * 0.34;
  return (
    <g>
      {shown.map((l, i) => (
        <text
          key={i}
          x="100"
          y={top + i * size * 0.95}
          textAnchor="middle"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fontWeight="900"
          fontSize={size}
          fill={color}
        >
          {l}
        </text>
      ))}
    </g>
  );
}
