"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ── utilitários ── */
function todayISO() { return new Date().toISOString().slice(0, 10); }
function num(v: string) { const n = parseFloat(v.replace(",", ".")); return isNaN(n) ? null : n; }

/* ── diagrama SVG do corpo ── */
const FIGURE_G = `<g fill="#6E6049">
  <circle cx="55" cy="18" r="11"/>
  <rect x="50.5" y="28" width="9" height="9" rx="3"/>
  <path d="M36,42 L74,42 C76,58 70,78 68,92 C70,104 72,112 72,118 L70,128 L40,128 L38,118 C38,112 40,104 42,92 C40,78 34,58 36,42 Z"/>
  <path d="M74,45 C80,48 83,64 84,82 L84,120 L78,121 L78,82 C77,66 72,52 68,49 Z"/>
  <path d="M36,45 C30,48 27,64 26,82 L26,120 L32,121 L32,82 C33,66 38,52 42,49 Z"/>
  <path d="M56,128 L70,128 C70,150 68,168 66,184 L64,202 L58,202 L57,184 C56,168 57,150 56,128 Z"/>
  <path d="M54,128 L40,128 C40,150 42,168 44,184 L46,202 L52,202 L53,184 C54,168 53,150 54,128 Z"/>
</g>`;

const BANDS: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  pescoco:     { cx: 55, cy: 33,  rx: 7,  ry: 2.6 },
  ombro:       { cx: 55, cy: 45,  rx: 20, ry: 4 },
  peito:       { cx: 55, cy: 62,  rx: 18, ry: 4 },
  cintura:     { cx: 55, cy: 92,  rx: 14, ry: 4 },
  abdomen:     { cx: 55, cy: 105, rx: 15, ry: 4 },
  quadril:     { cx: 55, cy: 118, rx: 18, ry: 4.5 },
  braco:       { cx: 80, cy: 68,  rx: 5,  ry: 2.6 },
  antebraco:   { cx: 81, cy: 104, rx: 4.8,ry: 2.6 },
  coxa:        { cx: 63, cy: 145, rx: 7,  ry: 3 },
  panturrilha: { cx: 62, cy: 174, rx: 5.5,ry: 3 },
};

function bodyFig(reg: string) {
  const b = BANDS[reg] ?? BANDS.cintura;
  const tick = (x: number) =>
    `<line x1="${x}" y1="${b.cy - 3.5}" x2="${x}" y2="${b.cy + 3.5}" stroke="#FF5A1F" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 110 210" style="width:100%;height:100%;display:block">
    ${FIGURE_G}
    <ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="none" stroke="#FF5A1F" stroke-width="2.6"/>
    ${tick(b.cx - b.rx)}${tick(b.cx + b.rx)}
  </svg>`;
}

/* ── grupos de medidas ── */
const MEDGROUPS = [
  { reg: "pescoco",     label: "Pescoço",    cap: "Na base do pescoço, fita reta.",              keys: [["pescoco", ""]] },
  { reg: "ombro",       label: "Ombro",      cap: "Volta na parte mais larga dos ombros.",       keys: [["ombro", ""]] },
  { reg: "peito",       label: "Peito",      cap: "Na linha dos mamilos, fita reta.",            keys: [["peito", ""]] },
  { reg: "cintura",     label: "Cintura",    cap: "No ponto mais fino, acima do umbigo.",        keys: [["cintura", ""]] },
  { reg: "abdomen",     label: "Abdômen",    cap: "Na altura do umbigo.",                        keys: [["abdomen", ""]] },
  { reg: "quadril",     label: "Quadril",    cap: "Na parte mais larga do bumbum.",              keys: [["quadril", ""]] },
  { reg: "braco",       label: "Braço",      cap: "No meio do braço, relaxado.",                 keys: [["braco_d", "D"], ["braco_e", "E"]] },
  { reg: "antebraco",   label: "Antebraço",  cap: "Na parte mais grossa do antebraço.",          keys: [["antebraco_d", "D"], ["antebraco_e", "E"]] },
  { reg: "coxa",        label: "Coxa",       cap: "Abaixo da virilha, parte mais grossa.",       keys: [["coxa_d", "D"], ["coxa_e", "E"]] },
  { reg: "panturrilha", label: "Panturrilha",cap: "Na parte mais grossa da panturrilha.",        keys: [["panturrilha_d", "D"], ["panturrilha_e", "E"]] },
];

/* ── estilos compartilhados ── */
const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--panel2)", border: "1px solid var(--line)",
  borderRadius: 8, color: "var(--txt)", fontSize: 16, padding: "11px 12px",
  outline: "none", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, color: "var(--muted)", textTransform: "uppercase",
  letterSpacing: ".05em", marginBottom: 6,
};
const fieldStyle: React.CSSProperties = { marginBottom: 13 };
const btnPrimary: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "center", border: "none", borderRadius: 8,
  fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".08em",
  fontWeight: 600, fontSize: 15, padding: 14, cursor: "pointer",
  background: "var(--laranja)", color: "#1a0e06", transition: ".15s",
};

/* ── Field standalone (fora dos forms para não perder foco) ── */
function Field({
  label, placeholder, type = "text", value, onChange, error = false,
}: {
  label: string; placeholder?: string; type?: string;
  value: string; onChange: (v: string) => void; error?: boolean;
}) {
  return (
    <div style={fieldStyle}>
      <label style={{ ...labelStyle, color: error ? "var(--bad)" : "var(--muted)" }}>
        {label}{error && <span style={{ marginLeft: 4, fontSize: 11 }}>← obrigatório</span>}
      </label>
      <input
        type={type}
        inputMode={type === "date" ? undefined : "decimal"}
        style={{ ...inputStyle, border: `1px solid ${error ? "var(--bad)" : "var(--line)"}` }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   SUB-TELA: PESAGEM
════════════════════════════════════════ */
function FormPesagem({ onSaved }: { onSaved: () => void }) {
  const [vals, setVals] = useState<Record<string, string>>({ data: todayISO() });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [erroPeso, setErroPeso] = useState(false);

  function set(k: string, v: string) {
    setVals(prev => ({ ...prev, [k]: v }));
    if (k === "peso") setErroPeso(false);
  }

  async function salvar() {
    if (!vals.peso) { setErroPeso(true); setMsg(""); return; }
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("pesagens").insert({
      user_id: user!.id,
      data: vals.data || todayISO(),
      peso: num(vals.peso),
      gordura: num(vals.gordura ?? ""),
      musculo: num(vals.musculo ?? ""),
      agua: num(vals.agua ?? ""),
      visceral: num(vals.visceral ?? ""),
      osso: num(vals.osso ?? ""),
      tmb: num(vals.tmb ?? ""),
      proteina: num(vals.proteina ?? ""),
      idade_corporal: num(vals.idadeC ?? ""),
      fc_repouso: num(vals.fcRep ?? ""),
      pressao: vals.pressao?.trim() || null,
    });
    setSaving(false);
    if (error) { setMsg("Erro ao salvar: " + error.message); return; }
    setMsg("Pesagem salva 💪");
    setVals({ data: todayISO() });
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 16 }}>
      <Field label="Data" type="date" value={vals.data ?? ""} onChange={v => set("data", v)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Peso (kg) *" placeholder="ex: 92,0" value={vals.peso ?? ""} onChange={v => set("peso", v)} error={erroPeso} />
        <Field label="Gordura (%)" value={vals.gordura ?? ""} onChange={v => set("gordura", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Massa muscular (kg)" value={vals.musculo ?? ""} onChange={v => set("musculo", v)} />
        <Field label="Água (%)" value={vals.agua ?? ""} onChange={v => set("agua", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Gordura visceral" value={vals.visceral ?? ""} onChange={v => set("visceral", v)} />
        <Field label="Massa óssea (kg)" value={vals.osso ?? ""} onChange={v => set("osso", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <Field label="TMB (kcal)" value={vals.tmb ?? ""} onChange={v => set("tmb", v)} />
        <Field label="Proteína (%)" value={vals.proteina ?? ""} onChange={v => set("proteina", v)} />
        <Field label="Idade corp." value={vals.idadeC ?? ""} onChange={v => set("idadeC", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="FC repouso (bpm)" placeholder="opc." value={vals.fcRep ?? ""} onChange={v => set("fcRep", v)} />
        <Field label="Pressão (mmHg)" placeholder="ex: 120/80" value={vals.pressao ?? ""} onChange={v => set("pressao", v)} />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--faint)", marginBottom: 13 }}>
        Preencha só o que a sua balança/medição mostra.
      </div>
      {msg && <div style={{ fontSize: 13, color: msg.includes("Erro") ? "var(--bad)" : "var(--good)", marginBottom: 10 }}>{msg}</div>}
      <button style={btnPrimary} disabled={saving} onClick={salvar}>
        {saving ? "Salvando…" : "Salvar pesagem"}
      </button>
      <button style={{ display: "block", width: "100%", marginTop: 10, background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: 12, cursor: "pointer", fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em", fontSize: 13 }} onClick={onSaved}>
        Ver painel
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   SUB-TELA: MEDIDAS
════════════════════════════════════════ */
function FormMedidas({ onSaved }: { onSaved: () => void }) {
  const [data, setData] = useState(todayISO());
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [erroVazio, setErroVazio] = useState(false);

  async function salvar() {
    const obj: Record<string, number | null | string> = { data };
    let has = false;
    MEDGROUPS.forEach(g => {
      g.keys.forEach(([k]) => {
        const v = num(vals[k] ?? "");
        obj[k] = v;
        if (v != null) has = true;
      });
    });
    if (!has) { setErroVazio(true); setMsg(""); return; }
    setErroVazio(false);
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    obj.user_id = user!.id;
    const { error } = await sb.from("medidas").insert(obj);
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg("Medidas salvas 📏");
    setVals({});
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div>
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14, marginBottom: 12 }}>
        <label style={labelStyle}>Data</label>
        <input type="date" style={inputStyle} value={data} onChange={e => setData(e.target.value)} />
      </div>
      <div style={{ fontSize: 11.5, color: erroVazio ? "var(--bad)" : "var(--faint)", margin: "-2px 2px 12px" }}>
        {erroVazio ? "Preencha ao menos uma medida antes de salvar." : "Cada medida mostra onde passar a fita. Meça relaxado, fita reta, mesma hora do dia. Preencha só o que quiser acompanhar."}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        {MEDGROUPS.map(g => (
          <div key={g.reg} style={{ display: "flex", gap: 11, alignItems: "center", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ width: 46, height: 64, flexShrink: 0, background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 7, padding: 3 }}
              dangerouslySetInnerHTML={{ __html: bodyFig(g.reg) }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 15, color: "var(--txt)", letterSpacing: ".02em" }}>{g.label}</div>
              <div style={{ fontSize: 11, color: "var(--faint)", lineHeight: 1.4, margin: "2px 0 8px" }}>{g.cap}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {g.keys.map(([k, suf]) => (
                  <div key={k} style={{ flex: 1 }}>
                    <input
                      style={{ ...inputStyle, padding: "9px 10px", fontSize: 15 }}
                      inputMode="decimal"
                      placeholder={suf ? `${suf} (cm)` : "cm"}
                      value={vals[k] ?? ""}
                      onChange={e => { setErroVazio(false); setVals(prev => ({ ...prev, [k]: e.target.value })); }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {msg && <div style={{ fontSize: 13, color: msg.includes("Erro") ? "var(--bad)" : "var(--good)", margin: "10px 0" }}>{msg}</div>}
      <button style={{ ...btnPrimary, marginTop: 14 }} disabled={saving} onClick={salvar}>
        {saving ? "Salvando…" : "Salvar medidas"}
      </button>
      <button style={{ display: "block", width: "100%", marginTop: 10, background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: 12, cursor: "pointer", fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em", fontSize: 13 }} onClick={onSaved}>
        Ver painel
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   SUB-TELA: TREINO
════════════════════════════════════════ */
function FormTreino({ onSaved, preset }: { onSaved: () => void; preset?: Record<string, string> }) {
  const [vals, setVals] = useState<Record<string, string>>({ data: todayISO(), esporte: "Corrida", ...preset });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set(k: string, v: string) { setVals(prev => ({ ...prev, [k]: v })); }

  async function salvar() {
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("treinos").insert({
      user_id: user!.id,
      data: vals.data || todayISO(),
      esporte: vals.esporte,
      duracao: num(vals.duracao ?? ""),
      distancia: num(vals.distancia ?? ""),
      esforco: num(vals.esforco ?? ""),
      notas: vals.notas?.trim() || null,
    });
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg("Treino salvo 🔥");
    setVals({ data: todayISO(), esporte: "Corrida" });
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 16 }}>
      <div style={fieldStyle}>
        <label style={labelStyle}>Data</label>
        <input type="date" style={inputStyle} value={vals.data} onChange={e => set("data", e.target.value)} />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Esporte</label>
        <select style={inputStyle} value={vals.esporte} onChange={e => set("esporte", e.target.value)}>
          {["Corrida", "Natação", "Bike", "Força", "Mobilidade", "Caminhada", "Outro"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { id: "duracao", label: "Duração (min)" },
          { id: "distancia", label: "Distância (km)" },
          { id: "esforco", label: "Esforço 1–10" },
        ].map(f => (
          <div key={f.id} style={fieldStyle}>
            <label style={labelStyle}>{f.label}</label>
            <input style={inputStyle} inputMode="decimal" value={vals[f.id] ?? ""} onChange={e => set(f.id, e.target.value)} />
          </div>
        ))}
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Como foi (notas)</label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 62 }}
          placeholder="sensação, dores, clima…"
          value={vals.notas ?? ""}
          onChange={e => set("notas", e.target.value)}
        />
      </div>
      {msg && <div style={{ fontSize: 13, color: msg.includes("Erro") ? "var(--bad)" : "var(--good)", marginBottom: 10 }}>{msg}</div>}
      <button style={btnPrimary} disabled={saving} onClick={salvar}>
        {saving ? "Salvando…" : "Salvar treino"}
      </button>
      <button style={{ display: "block", width: "100%", marginTop: 10, background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: 12, cursor: "pointer", fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em", fontSize: 13 }} onClick={onSaved}>
        Ver painel
      </button>
      <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 12 }}>
        Registre logo após treinar. Para escolher um treino pronto, vá na aba Treinos.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PÁGINA PRINCIPAL
════════════════════════════════════════ */
export default function RegistrarPage() {
  const [sub, setSub] = useState<"pesagem" | "medidas" | "treino">("pesagem");
  const [preset, setPreset] = useState<Record<string, string> | undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const esporte = searchParams.get("esporte");
    if (esporte) {
      const p: Record<string, string> = { esporte };
      const dur = searchParams.get("dur");
      const notas = searchParams.get("notas");
      if (dur) p.duracao = dur;
      if (notas) p.notas = notas;
      setPreset(p);
      setSub("treino");
    }
  }, [searchParams]);

  function onSaved() { router.push("/painel"); }

  const segBtn = (k: typeof sub, label: string) => (
    <button
      key={k}
      onClick={() => setSub(k)}
      style={{
        flex: 1, background: sub === k ? "var(--laranja)" : "var(--panel)",
        border: `1px solid ${sub === k ? "var(--laranja)" : "var(--line)"}`,
        color: sub === k ? "#1a0e06" : "var(--muted)",
        fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".05em",
        fontSize: 12, fontWeight: 600, padding: "9px 7px", borderRadius: 8,
        cursor: "pointer", transition: ".15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {segBtn("pesagem", "Pesagem")}
        {segBtn("medidas", "Medidas")}
        {segBtn("treino", "Treino")}
      </div>
      {sub === "pesagem" && <FormPesagem onSaved={onSaved} />}
      {sub === "medidas" && <FormMedidas onSaved={onSaved} />}
      {sub === "treino" && <FormTreino onSaved={onSaved} preset={preset} />}
    </div>
  );
}
