"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── utils ── */
function r1(n: number) { return Math.round(n * 10) / 10; }
function brDateFull(iso: string) {
  if (!iso) return "—";
  const p = iso.slice(0, 10).split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}
function hhmm(d: Date) {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function num(v: string) { const n = parseFloat(v.replace(",", ".")); return isNaN(n) ? null : n; }

/* ── estilos ── */
const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--panel2)", border: "1px solid var(--line)",
  borderRadius: 8, color: "var(--txt)", fontSize: 15, padding: "11px 12px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, color: "var(--muted)", textTransform: "uppercase",
  letterSpacing: ".05em", marginBottom: 6,
};
const segBtnStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--laranja)" : "var(--panel2)",
  color: active ? "#1a0e06" : "var(--muted)",
  border: `1px solid ${active ? "var(--laranja)" : "var(--line2)"}`,
  borderRadius: 7, fontFamily: "var(--font-oswald)", textTransform: "uppercase",
  letterSpacing: ".07em", fontWeight: 600, fontSize: 12, padding: "8px 14px",
  cursor: "pointer", transition: ".15s", whiteSpace: "nowrap" as const,
});

/* ════════ HISTÓRICO ════════ */
type HistSub = "peso" | "medidas" | "treino" | "jejum";

function HistoricoPeso() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from("pesagens").select("*").eq("user_id", user.id).order("data", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  async function apagar(id: string) {
    await sb.from("pesagens").delete().eq("id", id);
    setRows(prev => prev.filter((r: Record<string, unknown>) => r.id !== id));
  }

  if (loading) return <div style={{ color: "var(--faint)", padding: 20, textAlign: "center" }}>Carregando…</div>;
  if (!rows.length) return <div style={{ color: "var(--faint)", textAlign: "center", padding: "38px 20px", fontSize: 14 }}>Nenhuma pesagem ainda.</div>;

  const FIELDS: [string, string, string][] = [
    ["peso", "kg", "Peso"], ["gordura", "%", "Gord."], ["musculo", "kg", "Músc."],
    ["agua", "%", "Água"], ["visceral", "", "Visc."], ["osso", "kg", "Osso"],
    ["tmb", "kcal", "TMB"], ["proteina", "%", "Prot."], ["idade_corporal", "a", "Idade"], ["fc_repouso", "bpm", "FC"],
  ];

  return (
    <div>
      {rows.map((p: Record<string, unknown>) => {
        const cells = FIELDS.filter(([k]) => p[k] != null).map(([k, u, lb]) => (
          <div key={k} style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {lb} <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{r1(p[k] as number)}{u}</b>
          </div>
        ));
        if (p.pressao) cells.push(
          <div key="pa" style={{ fontSize: 12.5, color: "var(--muted)" }}>PA <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{String(p.pressao)}</b></div>
        );
        return (
          <div key={String(p.id)} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 13px", marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, letterSpacing: ".05em", color: "var(--txt)", fontSize: 14 }}>{brDateFull(String(p.data))}</span>
              <button onClick={() => apagar(String(p.id))} style={{ background: "none", border: "none", color: "var(--faint)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>apagar</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>{cells}</div>
          </div>
        );
      })}
    </div>
  );
}

function HistoricoMedidas() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from("medidas").select("*").eq("user_id", user.id).order("data", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  async function apagar(id: string) {
    await sb.from("medidas").delete().eq("id", id);
    setRows(prev => prev.filter((r: Record<string, unknown>) => r.id !== id));
  }

  if (loading) return <div style={{ color: "var(--faint)", padding: 20, textAlign: "center" }}>Carregando…</div>;
  if (!rows.length) return <div style={{ color: "var(--faint)", textAlign: "center", padding: "38px 20px", fontSize: 14 }}>Nenhuma medida ainda.</div>;

  const MEDS: [string, string][] = [
    ["pescoco", "Pescoço"], ["ombro", "Ombro"], ["peito", "Peito"],
    ["cintura", "Cintura"], ["abdomen", "Abdômen"], ["quadril", "Quadril"],
    ["braco_d", "Braço D"], ["braco_e", "Braço E"],
    ["antebraco_d", "Antebr. D"], ["antebraco_e", "Antebr. E"],
    ["coxa_d", "Coxa D"], ["coxa_e", "Coxa E"],
    ["panturrilha_d", "Pantur. D"], ["panturrilha_e", "Pantur. E"],
  ];

  return (
    <div>
      {rows.map((m: Record<string, unknown>) => {
        const cells = MEDS.filter(([k]) => m[k] != null).map(([k, lb]) => (
          <div key={k} style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {lb} <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{r1(m[k] as number)}cm</b>
          </div>
        ));
        return (
          <div key={String(m.id)} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 13px", marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, letterSpacing: ".05em", color: "var(--txt)", fontSize: 14 }}>{brDateFull(String(m.data))}</span>
              <button onClick={() => apagar(String(m.id))} style={{ background: "none", border: "none", color: "var(--faint)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>apagar</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>{cells}</div>
          </div>
        );
      })}
    </div>
  );
}

function HistoricoTreino() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from("treinos").select("*").eq("user_id", user.id).order("data", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  async function apagar(id: string) {
    await sb.from("treinos").delete().eq("id", id);
    setRows(prev => prev.filter((r: Record<string, unknown>) => r.id !== id));
  }

  if (loading) return <div style={{ color: "var(--faint)", padding: 20, textAlign: "center" }}>Carregando…</div>;
  if (!rows.length) return <div style={{ color: "var(--faint)", textAlign: "center", padding: "38px 20px", fontSize: 14 }}>Nenhum treino ainda.</div>;

  return (
    <div>
      {rows.map((t: Record<string, unknown>) => (
        <div key={String(t.id)} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 13px", marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, letterSpacing: ".05em", color: "var(--txt)", fontSize: 14 }}>{brDateFull(String(t.data))}</span>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", color: "var(--couro)", border: "1px solid var(--line)", fontWeight: 600 }}>{String(t.esporte)}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
            {t.duracao != null && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Duração <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{String(t.duracao)}min</b></div>}
            {t.distancia != null && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Distância <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{String(t.distancia)}km</b></div>}
            {t.esforco != null && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Esforço <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{String(t.esforco)}/10</b></div>}
          </div>
          {t.notas && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 7, fontStyle: "italic" }}>{String(t.notas)}</div>}
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <button onClick={() => apagar(String(t.id))} style={{ background: "none", border: "none", color: "var(--faint)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>apagar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoricoJejum() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from("jejuns").select("*").eq("user_id", user.id).not("fim", "is", null).order("inicio", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ color: "var(--faint)", padding: 20, textAlign: "center" }}>Carregando…</div>;
  if (!rows.length) return <div style={{ color: "var(--faint)", textAlign: "center", padding: "38px 20px", fontSize: 14 }}>Nenhum jejum ainda.</div>;

  return (
    <div>
      {rows.map((f: Record<string, unknown>) => {
        const ini = new Date(String(f.inicio));
        const fim = new Date(String(f.fim));
        const batido = Boolean(f.alvo_batido);
        return (
          <div key={String(f.id)} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 13px", marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, letterSpacing: ".05em", color: "var(--txt)", fontSize: 14 }}>{brDateFull(String(f.inicio))}</span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", border: "1px solid var(--line)", fontWeight: 600, color: batido ? "#8FBF8A" : "var(--muted)" }}>
                {batido ? "meta ✓" : "parcial"}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
              {f.horas != null && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Duração <b style={{ color: "var(--txt)", fontFamily: "var(--font-oswald)", fontSize: 14 }}>{String(f.horas)}h</b></div>}
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{hhmm(ini)} → {hhmm(fim)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════ PERFIL ════════ */
function SeusDados() {
  const [vals, setVals] = useState({ altura: "", dataInicio: "", pesoMeta: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const sb = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from("perfil").select("*").eq("user_id", user.id).single();
      if (data) setVals({
        altura: data.altura != null ? String(data.altura) : "",
        dataInicio: data.data_inicio ?? "",
        pesoMeta: data.peso_meta != null ? String(data.peso_meta) : "",
      });
    })();
  }, []); // eslint-disable-line

  async function salvar() {
    setSaving(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = {
      user_id: user.id,
      altura: num(vals.altura),
      data_inicio: vals.dataInicio || null,
      peso_meta: num(vals.pesoMeta),
    };
    const { error } = await sb.from("perfil").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    setMsg(error ? "Erro: " + error.message : "Salvo ✓");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Altura (cm)</label>
          <input style={inputStyle} inputMode="numeric" placeholder="ex: 174" value={vals.altura} onChange={e => setVals(p => ({ ...p, altura: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Início da jornada</label>
          <input type="date" style={inputStyle} value={vals.dataInicio} onChange={e => setVals(p => ({ ...p, dataInicio: e.target.value }))} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Meta de peso (kg) — opcional</label>
        <input style={inputStyle} inputMode="decimal" value={vals.pesoMeta} onChange={e => setVals(p => ({ ...p, pesoMeta: e.target.value }))} />
      </div>
      {msg && <div style={{ fontSize: 13, color: msg.startsWith("Erro") ? "var(--bad)" : "var(--good)", marginBottom: 10 }}>{msg}</div>}
      <button
        onClick={salvar}
        disabled={saving}
        style={{ display: "block", width: "100%", textAlign: "center", border: "none", borderRadius: 8, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, fontSize: 15, padding: 14, cursor: "pointer", background: "var(--laranja)", color: "#1a0e06" }}
      >
        {saving ? "Salvando…" : "Salvar"}
      </button>
      <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 10, lineHeight: 1.5 }}>
        Altura calcula IMC e cintura/altura. Data de início conta os "dias de jornada".
      </div>
    </div>
  );
}

/* ════════ PÁGINA ════════ */
export default function MaisPage() {
  const [histSub, setHistSub] = useState<HistSub>("peso");

  const tabStyle = (k: string): React.CSSProperties => ({
    flex: 1, background: histSub === k ? "var(--laranja)" : "var(--panel)",
    border: `1px solid ${histSub === k ? "var(--laranja)" : "var(--line)"}`,
    color: histSub === k ? "#1a0e06" : "var(--muted)",
    fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".05em",
    fontSize: 11, fontWeight: 600, padding: "8px 4px", borderRadius: 8,
    cursor: "pointer", transition: ".15s",
  });

  return (
    <div>
      {/* Histórico */}
      <div style={{ fontSize: 13, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 12 }}>
        Histórico
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button style={tabStyle("peso")} onClick={() => setHistSub("peso")}>Peso</button>
        <button style={tabStyle("medidas")} onClick={() => setHistSub("medidas")}>Medidas</button>
        <button style={tabStyle("treino")} onClick={() => setHistSub("treino")}>Treino</button>
        <button style={tabStyle("jejum")} onClick={() => setHistSub("jejum")}>Jejum</button>
      </div>

      {histSub === "peso" && <HistoricoPeso />}
      {histSub === "medidas" && <HistoricoMedidas />}
      {histSub === "treino" && <HistoricoTreino />}
      {histSub === "jejum" && <HistoricoJejum />}

      {/* Seus dados */}
      <div style={{ fontSize: 13, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", margin: "24px 0 12px" }}>
        Seus dados
      </div>
      <SeusDados />

      <div style={{ fontSize: 11.5, color: "var(--faint)", margin: "16px 2px 0", lineHeight: 1.6 }}>
        Motor Próprio · seus dados ficam salvos na nuvem via Supabase.
      </div>
    </div>
  );
}
