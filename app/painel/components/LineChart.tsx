/* Componente de gráfico de linha SVG — compartilhado entre Painel e Mais */

function r1(n: number) { return Math.round(n * 10) / 10; }
function brDate(iso: string) { const p = iso.split("-"); return `${p[2]}/${p[1]}/${p[0].slice(2)}`; }

export default function LineChart({
  points, color, unit, id,
}: {
  points: { x: string; y: number | null }[];
  color: string;
  unit: string;
  id: string;
}) {
  const pts = points.filter(p => p.y != null) as { x: string; y: number }[];
  if (pts.length === 0) return (
    <div style={{ color: "var(--faint)", fontSize: 13, textAlign: "center", padding: "34px 10px" }}>
      Sem dados ainda.
    </div>
  );
  const W = 340, H = 150, ml = 8, mr = 16, mt = 14, mb = 22;
  const ys = pts.map(p => p.y);
  let mn = Math.min(...ys), mx = Math.max(...ys);
  if (mn === mx) { mn -= 1; mx += 1; }
  const pad = (mx - mn) * 0.12; mn -= pad; mx += pad;
  const n = pts.length;
  const X = (i: number) => ml + (n === 1 ? (W - ml - mr) / 2 : (i * (W - ml - mr) / (n - 1)));
  const Y = (v: number) => mt + (H - mt - mb) * (1 - (v - mn) / (mx - mn));
  let grid = "";
  for (let g = 0; g <= 2; g++) {
    const val = mn + (mx - mn) * g / 2, y = Y(val);
    grid += `<line x1="${ml}" y1="${y.toFixed(1)}" x2="${W - mr}" y2="${y.toFixed(1)}" stroke="#362E24" stroke-width="1"/>`;
    grid += `<text x="${W - mr + 2}" y="${(y + 3).toFixed(1)}" fill="#7A6F5E" font-size="9">${r1(val)}</text>`;
  }
  let area = `M ${X(0).toFixed(1)} ${Y(pts[0].y).toFixed(1)}`;
  let line = area;
  for (let i = 1; i < n; i++) {
    const seg = ` L ${X(i).toFixed(1)} ${Y(pts[i].y).toFixed(1)}`;
    area += seg; line += seg;
  }
  area += ` L ${X(n - 1).toFixed(1)} ${(H - mb).toFixed(1)} L ${X(0).toFixed(1)} ${(H - mb).toFixed(1)} Z`;
  let dots = "";
  for (let i = 0; i < n; i++) {
    dots += `<circle cx="${X(i).toFixed(1)}" cy="${Y(pts[i].y).toFixed(1)}" r="${i === n - 1 ? 3.4 : 2}" fill="${i === n - 1 ? color : "#14100B"}" stroke="${color}" stroke-width="1.6"/>`;
  }
  const last = pts[n - 1];
  const lab = `${r1(last.y)}${unit ? " " + unit : ""}`;
  const lx = Math.min(X(n - 1), W - mr - 40), ly = Math.max(Y(last.y) - 9, 12);
  const xl = `<text x="${ml}" y="${H - 6}" fill="#7A6F5E" font-size="9">${brDate(pts[0].x)}</text>` +
    (n > 1 ? `<text x="${W - mr}" y="${H - 6}" fill="#7A6F5E" font-size="9" text-anchor="end">${brDate(last.x)}</text>` : "");
  const svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
    ${grid}
    <defs><linearGradient id="g_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#g_${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${color}" font-size="11" font-weight="700" font-family="Oswald,sans-serif">${lab}</text>
    ${xl}
  </svg>`;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
