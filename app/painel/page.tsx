"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── tipos ── */
type Pesagem = {
  id: string; data: string; peso: number | null; gordura: number | null;
  musculo: number | null; visceral: number | null; agua: number | null;
  fc_repouso: number | null;
};
type Medida = {
  id: string; data: string; cintura: number | null; quadril: number | null; abdomen: number | null;
};
type Treino = { id: string; data: string; esporte: string; };
type Marco = { id: string; nome: string; concluido: boolean; data_conclusao: string | null; };
type Perfil = { altura: number | null; data_inicio: string | null; peso_meta: number | null; } | null;
type Jejum = { id: string; inicio: string; fim: string | null; horas: number | null; alvo_horas: number; alvo_batido: boolean; };

/* ── utilitários ── */
function r1(n: number) { return Math.round(n * 10) / 10; }
function r2(n: number) { return Math.round(n * 100) / 100; }
function sortAsc<T extends { data: string }>(arr: T[]) {
  return [...arr].sort((a, b) => a.data < b.data ? -1 : 1);
}
function brDate(iso: string) {
  const p = iso.split("-"); return `${p[2]}/${p[1]}/${p[0]}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function isoWeekKey(d: string) {
  const dt = new Date(d); const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day); return dt.toISOString().slice(0, 10);
}

/* ── gráfico de linha SVG ── */
function LineChart({ points, color, unit, id }: { points: { x: string; y: number | null }[]; color: string; unit: string; id: string; }) {
  const pts = points.filter(p => p.y != null) as { x: string; y: number }[];
  if (pts.length === 0) return (
    <div style={{ color: "var(--faint)", fontSize: 13, textAlign: "center", padding: "34px 10px" }}>
      Sem dados ainda. Registre na aba Registrar pra ver a curva.
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
  const c = (2 * Math.PI * 54).toFixed(1);
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

/* ── configuração de métricas ── */
const CHARTABLE = [
  { k: "peso", label: "Peso", unit: "kg", src: "pes", col: "#FF5A1F", down: true },
  { k: "gordura", label: "Gordura", unit: "%", src: "pes", col: "#FF5A1F", down: true },
  { k: "musculo", label: "Músculo", unit: "kg", src: "pes", col: "#8FBF8A", down: false },
  { k: "visceral", label: "Visceral", unit: "", src: "pes", col: "#B5803F", down: true },
  { k: "fc_repouso", label: "FC rep.", unit: "bpm", src: "pes", col: "#FF5A1F", down: true },
  { k: "cintura", label: "Cintura", unit: "cm", src: "med", col: "#FF5A1F", down: true },
  { k: "abdomen", label: "Abdômen", unit: "cm", src: "med", col: "#B5803F", down: true },
  { k: "quadril", label: "Quadril", unit: "cm", src: "med", col: "#8FBF8A", down: true },
];

function deltaDir(d: number, down: boolean) {
  if (d === 0) return "flat";
  return (d < 0) === down ? "good" : "bad";
}

/* ── componente principal ── */
export default function PainelPage() {
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [marcos, setMarcos] = useState<Marco[]>([]);
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [jejuns, setJejuns] = useState<Jejum[]>([]);
  const [chartMetric, setChartMetric] = useState("peso");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    const uid = user!.id;

    const [p, m, t, mk, pf, jj] = await Promise.all([
      sb.from("pesagens").select("id,data,peso,gordura,musculo,visceral,agua,fc_repouso").order("data"),
      sb.from("medidas").select("id,data,cintura,quadril,abdomen").order("data"),
      sb.from("treinos").select("id,data,esporte").order("data"),
      sb.from("marcos").select("id,nome,concluido,data_conclusao").order("created_at"),
      sb.from("perfil").select("altura,data_inicio,peso_meta").maybeSingle(),
      sb.from("jejuns").select("id,inicio,fim,horas,alvo_horas,alvo_batido").not("fim", "is", null).order("inicio"),
    ]);

    // Semeia marcos padrão se o usuário ainda não tiver nenhum
    let marcosData = mk.data ?? [];
    if (marcosData.length === 0) {
      const defaults = [
        "30 min contínuos de movimento",
        "Primeira corrida 5k (caminhada-corrida)",
        "Nado contínuo (200–400 m)",
        "Pedal longo (40+ km)",
        "Primeiro brick (bike → corrida)",
        "Primeira trilha / terreno",
        "Mini-expedição ou 1º evento",
      ].map(nome => ({ user_id: uid, nome, concluido: false, data_conclusao: null }));
      const { data: inserted } = await sb.from("marcos").insert(defaults).select("id,nome,concluido,data_conclusao");
      marcosData = inserted ?? [];
    }

    setPesagens(p.data ?? []);
    setMedidas(m.data ?? []);
    setTreinos(t.data ?? []);
    setMarcos(marcosData);
    setPerfil(pf.data ?? null);
    setJejuns((jj.data ?? []) as Jejum[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function toggleMarco(mk: Marco) {
    const sb = createClient();
    const concluido = !mk.concluido;
    const data_conclusao = concluido ? todayISO() : null;
    await sb.from("marcos").update({ concluido, data_conclusao }).eq("id", mk.id);
    setMarcos(prev => prev.map(m => m.id === mk.id ? { ...m, concluido, data_conclusao } : m));
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--faint)", fontSize: 14 }}>
      Carregando…
    </div>
  );

  /* ── stats ── */
  const pes = sortAsc(pesagens), med = sortAsc(medidas), tre = sortAsc(treinos);
  const first = pes[0] ?? null, last = pes[pes.length - 1] ?? null;
  const medFirst = med[0] ?? null, medLast = med[med.length - 1] ?? null;

  let inicio = perfil?.data_inicio ?? "";
  if (!inicio) {
    const c: string[] = [];
    if (first) c.push(first.data);
    if (tre[0]) c.push(tre[0].data);
    if (med[0]) c.push(med[0].data);
    c.sort(); inicio = c[0] ?? "";
  }
  let dia: number | null = inicio ? daysBetween(inicio, todayISO()) + 1 : null;
  if (dia != null && dia < 1) dia = 1;

  const tw = isoWeekKey(todayISO());
  const treThisWeek = tre.filter(t => isoWeekKey(t.data) === tw).length;
  const ww = new Set(tre.map(t => isoWeekKey(t.data)));
  let streak = 0;
  const curDate = new Date(tw);
  if (!ww.has(tw)) curDate.setDate(curDate.getDate() - 7);
  while (ww.has(curDate.toISOString().slice(0, 10))) {
    streak++;
    curDate.setDate(curDate.getDate() - 7);
  }

  const isEmpty = pes.length === 0 && tre.length === 0 && med.length === 0;

  /* ── jejum streak ── */
  const jejumDays = new Set(jejuns.filter(j => j.alvo_batido).map(j => (j.fim ?? j.inicio).slice(0, 10)));
  let jejumStreak = 0;
  const jd = new Date(todayISO());
  if (!jejumDays.has(todayISO())) jd.setDate(jd.getDate() - 1);
  while (jejumDays.has(jd.toISOString().slice(0, 10))) { jejumStreak++; jd.setDate(jd.getDate() - 1); }

  /* ── série do gráfico ── */
  function seriesFor(k: string) {
    const m = CHARTABLE.find(x => x.k === k)!;
    const src = m.src === "med" ? med : pes;
    return src.map(r => ({ x: r.data, y: ((r as unknown) as Record<string, number | null>)[k] ?? null }));
  }

  /* ── constância (8 semanas) ── */
  const weeks: string[] = [];
  const base = new Date(isoWeekKey(todayISO()));
  for (let i = 7; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i * 7);
    weeks.push(d.toISOString().slice(0, 10));
  }
  const counts = weeks.map(w => treinos.filter(t => isoWeekKey(t.data) === w).length);
  const maxC = Math.max(3, ...counts);

  /* ── por esporte ── */
  const byEsporte: Record<string, number> = {};
  treinos.forEach(t => { byEsporte[t.esporte] = (byEsporte[t.esporte] ?? 0) + 1; });
  const maxB = Math.max(...Object.values(byEsporte), 1);

  /* ── cores delta ── */
  const deltaColor = { good: "var(--good)", bad: "var(--bad)", flat: "var(--faint)" };

  const mm = CHARTABLE.find(m => m.k === chartMetric)!;

  /* ── card de métrica ── */
  function MetricCard({ k, label, unit, down }: { k: string; label: string; unit: string; down: boolean }) {
    const src = k === "cintura" || k === "abdomen" || k === "quadril" ? medLast : last;
    const val = src ? ((src as unknown) as Record<string, number | null>)[k] : null;
    if (val == null) return null;
    const firstSrc = k === "cintura" || k === "abdomen" || k === "quadril" ? medFirst : first;
    const len = k === "cintura" || k === "abdomen" || k === "quadril" ? med.length : pes.length;
    let deltaEl = <div style={{ fontSize: 12, marginTop: 5, color: "var(--faint)" }}>— sem comparação</div>;
    if (firstSrc && len >= 2) {
      const fv = ((firstSrc as unknown) as Record<string, number | null>)[k];
      if (fv != null) {
        const d = val - fv;
        const dir = deltaDir(d, down);
        const ar = d < 0 ? "▼" : d > 0 ? "▲" : "•";
        deltaEl = <div style={{ fontSize: 12, marginTop: 5, fontWeight: 600, color: deltaColor[dir] }}>{ar} {Math.abs(r1(d))}{unit ? " " + unit : ""} desde o início</div>;
      }
    }
    return (
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 29, lineHeight: 1.05, marginTop: 6, color: "var(--txt)" }}>
          {r1(val)}<small style={{ fontSize: 13, color: "var(--faint)", fontWeight: 500, marginLeft: 3 }}>{unit}</small>
        </div>
        {deltaEl}
      </div>
    );
  }

  return (
    <div>
      {isEmpty ? (
        <div style={{ textAlign: "center", color: "var(--faint)", padding: "38px 20px", fontSize: 14, lineHeight: 1.6 }}>
          <b style={{ color: "var(--muted)", display: "block", marginBottom: 6, fontSize: 15 }}>Bora começar 🏁</b>
          Registre sua primeira pesagem, medidas e treino na aba <b>Registrar</b>. Aqui aparecem as curvas desde o dia 1.
        </div>
      ) : (
        <>
          {/* Strip de stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 4 }}>
            {[
              { v: dia ?? "—", k: "Dia jornada" },
              { v: treinos.length, k: "Treinos" },
              { v: streak, k: "Sem. seguidas" },
              { v: treThisWeek, k: "Esta semana" },
              { v: jejuns.length, k: "Jejuns" },
              { v: jejumStreak, k: "Dias jejum" },
            ].map(s => (
              <div key={s.k} style={{ background: "linear-gradient(160deg,#241d15,#1a150f)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 22, color: "var(--laranja)", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 6 }}>{s.k}</div>
              </div>
            ))}
          </div>

          {/* Composição corporal */}
          {last && (
            <>
              <div style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, fontSize: 13, color: "var(--couro)", margin: "26px 2px 13px", display: "flex", alignItems: "center", gap: 8 }}>
                Composição corporal
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <MetricCard k="peso" label="Peso" unit="kg" down={true} />
                <MetricCard k="gordura" label="Gordura" unit="%" down={true} />
                <MetricCard k="musculo" label="Músculo" unit="kg" down={false} />
                <MetricCard k="visceral" label="Visceral" unit="" down={true} />
                {last.peso != null && perfil?.altura && (() => {
                  const h = perfil.altura! / 100;
                  const imc = last.peso! / (h * h);
                  return (
                    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>IMC</div>
                      <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 29, lineHeight: 1.05, marginTop: 6, color: "var(--txt)" }}>{r1(imc)}</div>
                      <div style={{ fontSize: 12, marginTop: 5, color: "var(--faint)" }}>altura {perfil.altura} cm</div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* Medidas */}
          {medLast && (
            <>
              <div style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, fontSize: 13, color: "var(--couro)", margin: "26px 2px 13px" }}>
                Medidas (fita)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <MetricCard k="cintura" label="Cintura" unit="cm" down={true} />
                <MetricCard k="abdomen" label="Abdômen" unit="cm" down={true} />
                {medLast.cintura != null && medLast.quadril != null && (() => {
                  const rcq = medLast.cintura! / medLast.quadril!;
                  const ok = rcq < 0.90;
                  return (
                    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>Cintura / Quadril</div>
                      <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 29, lineHeight: 1.05, marginTop: 6, color: "var(--txt)" }}>{r2(rcq)}</div>
                      <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: ok ? "var(--good)" : "var(--bad)" }}>{ok ? "dentro da faixa" : "acima do ideal"}</div>
                    </div>
                  );
                })()}
                {medLast.cintura != null && perfil?.altura && (() => {
                  const cah = medLast.cintura! / perfil.altura!;
                  const ok = cah < 0.5;
                  return (
                    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>Cintura / Altura</div>
                      <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 29, lineHeight: 1.05, marginTop: 6, color: "var(--txt)" }}>{r2(cah)}</div>
                      <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: ok ? "var(--good)" : "var(--bad)" }}>{ok ? "saudável (<0,50)" : "meta: <0,50"}</div>
                    </div>
                  );
                })()}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.55, marginTop: 12 }}>
                Cintura/altura abaixo de 0,50 é um dos melhores indicadores simples de saúde — costuma dizer mais que o IMC.
              </div>
            </>
          )}

          {/* Gráfico de evolução */}
          <div style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, fontSize: 13, color: "var(--couro)", margin: "26px 2px 13px" }}>
            Evolução
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {CHARTABLE.map(m => (
              <button
                key={m.k}
                onClick={() => setChartMetric(m.k)}
                style={{
                  flex: 1, minWidth: 56, background: chartMetric === m.k ? "var(--laranja)" : "var(--panel)",
                  border: `1px solid ${chartMetric === m.k ? "var(--laranja)" : "var(--line)"}`,
                  color: chartMetric === m.k ? "#1a0e06" : "var(--muted)",
                  fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".05em",
                  fontSize: 12, fontWeight: 600, padding: "9px 7px", borderRadius: 8, cursor: "pointer", transition: ".15s",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 10px 8px" }}>
            <LineChart points={seriesFor(chartMetric)} color={mm.col} unit={mm.unit} id={chartMetric} />
          </div>

          {/* Constância */}
          <div style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, fontSize: 13, color: "var(--couro)", margin: "26px 2px 13px" }}>
            Constância (treinos/semana)
          </div>
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 10px 8px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 94, padding: "4px 2px 0" }}>
              {weeks.map((w, i) => {
                const c = counts[i];
                const hp = Math.round(c / maxC * 100);
                return (
                  <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 11, color: "var(--txt)", fontWeight: 600, fontFamily: "var(--font-oswald)" }}>{c || ""}</div>
                    <div style={{ width: "100%", background: c === 0 ? "var(--line)" : "linear-gradient(180deg,var(--mataLt),var(--mata))", borderRadius: "3px 3px 0 0", height: c === 0 ? 4 : `${hp}%`, minHeight: 3 }} />
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{parseInt(w.slice(8, 10))}/{w.slice(5, 7)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Por esporte */}
          {treinos.length > 0 && (
            <>
              <div style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, fontSize: 13, color: "var(--couro)", margin: "26px 2px 13px" }}>
                Por esporte
              </div>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "6px 14px" }}>
                {Object.entries(byEsporte).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 13, color: "var(--txt)", width: 96, flexShrink: 0 }}>{k}</div>
                    <div style={{ flex: 1, height: 7, background: "var(--panel2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--couro)", borderRadius: 4, width: `${Math.round(v / maxB * 100)}%` }} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", width: 62, textAlign: "right", flexShrink: 0 }}>{v} trein{v > 1 ? "os" : "o"}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Marcos da jornada — sempre visível */}
      <div style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, fontSize: 13, color: "var(--couro)", margin: "26px 2px 13px" }}>
        Marcos da jornada
      </div>
      {marcos.length === 0 ? (
        <div style={{ color: "var(--faint)", fontSize: 13, textAlign: "center", padding: 20 }}>
          Nenhum marco ainda. Adicione na aba <b>Mais</b>.
        </div>
      ) : (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "4px 14px" }}>
          {marcos.map(mk => (
            <div key={mk.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
              <button
                onClick={() => toggleMarco(mk)}
                style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: mk.concluido ? "var(--laranja)" : "var(--panel2)",
                  border: `2px solid ${mk.concluido ? "var(--laranja)" : "var(--line2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: ".15s",
                }}
              >
                {mk.concluido && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a0e06" strokeWidth={3} width={14} height={14}>
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </button>
              <div style={{ flex: 1, fontSize: 13.5, color: mk.concluido ? "var(--faint)" : "var(--txt)", textDecoration: mk.concluido ? "line-through" : "none" }}>
                {mk.nome}
              </div>
              {mk.concluido && mk.data_conclusao && (
                <div style={{ fontSize: 11, color: "var(--muted)", background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 7px" }}>
                  {brDate(mk.data_conclusao)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.55, marginTop: 12 }}>
        Peso e medidas oscilam dia a dia — olhe a tendência ao longo de semanas, não o número de um dia.
      </div>
    </div>
  );
}
