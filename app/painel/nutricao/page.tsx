"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── utils ── */
function todayISO() { return new Date().toISOString().slice(0, 10); }
function hhmm(d: Date) { return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function fmtHMS(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
}
function r1(n: number) { return Math.round(n * 10) / 10; }

/* ── receitas ── */
interface Recipe { c: string; n: string; t: number; tag: string; ing: string[]; mod: string[]; }
const RECIPES: Recipe[] = [
  { c: "Café da manhã", n: "Ovos mexidos com abacate", t: 10, tag: "Proteína + gordura boa", ing: ["3 ovos", "1/2 abacate", "1 fatia de pão integral", "Sal, pimenta, cebolinha"], mod: ["Mexa os ovos em fogo baixo com um fio de azeite.", "Amasse o abacate com sal e pimenta.", "Sirva sobre o pão com a cebolinha."] },
  { c: "Café da manhã", n: "Iogurte com aveia e frutas", t: 5, tag: "Fibra + proteína", ing: ["1 pote de iogurte natural", "3 col. de aveia", "1 fruta picada", "1 col. de chia", "Castanhas a gosto"], mod: ["Misture o iogurte com a aveia e a chia.", "Cubra com a fruta e as castanhas."] },
  { c: "Café da manhã", n: "Omelete de legumes", t: 12, tag: "Leve e proteico", ing: ["2 ovos + 2 claras", "Tomate, espinafre, cebola", "Queijo branco", "Sal, orégano"], mod: ["Bata os ovos com sal.", "Refogue os legumes rapidamente.", "Acrescente os ovos, dobre e finalize com queijo."] },
  { c: "Almoço/Jantar", n: "Frango, batata-doce e salada", t: 30, tag: "Clássico de performance", ing: ["1 filé de frango", "1 batata-doce média", "Folhas verdes, tomate, pepino", "Azeite e limão"], mod: ["Tempere e grelhe o frango.", "Asse ou cozinhe a batata-doce.", "Monte a salada e tempere com azeite e limão."] },
  { c: "Almoço/Jantar", n: "Tilápia, arroz integral e brócolis", t: 25, tag: "Magro e completo", ing: ["1 filé de tilápia", "1 xíc. de arroz integral cozido", "Brócolis", "Alho, azeite, limão"], mod: ["Grelhe a tilápia com alho e limão.", "Cozinhe o brócolis no vapor.", "Sirva com o arroz integral."] },
  { c: "Almoço/Jantar", n: "Carne magra com legumes", t: 25, tag: "Proteína + vegetais", ing: ["150 g de patinho em tiras", "Abobrinha, cenoura, pimentão", "Cebola, alho", "Azeite, shoyu leve"], mod: ["Sele a carne em fogo alto.", "Acrescente os legumes e salteie rápido.", "Finalize com um toque de shoyu."] },
  { c: "Almoço/Jantar", n: "Salada completa com grão-de-bico", t: 15, tag: "Sem fogão, rica", ing: ["1 xíc. de grão-de-bico cozido", "2 ovos cozidos", "Folhas, tomate, cenoura ralada", "Atum (opcional)", "Azeite, limão"], mod: ["Misture o grão-de-bico com as folhas e legumes.", "Adicione os ovos e o atum.", "Tempere com azeite e limão."] },
  { c: "Lanches", n: "Iogurte com castanhas", t: 3, tag: "Proteína rápida", ing: ["1 pote de iogurte natural", "1 punhado de castanhas", "Canela a gosto"], mod: ["Misture e pronto."] },
  { c: "Lanches", n: "Fruta com pasta de amendoim", t: 3, tag: "Energia pré-treino", ing: ["1 banana ou maçã", "1 col. de pasta de amendoim integral"], mod: ["Corte a fruta e sirva com a pasta."] },
  { c: "Lanches", n: "Ovos cozidos temperados", t: 10, tag: "Proteína prática", ing: ["2–3 ovos", "Sal, pimenta, páprica"], mod: ["Cozinhe os ovos 8–9 min.", "Tempere e leve pra qualquer lugar."] },
];
const RECCATS = ["Café da manhã", "Almoço/Jantar", "Lanches"];

const GUIA = [
  "Proteína em toda refeição — preserva músculo e segura a fome.",
  "Comida de verdade: menos ultraprocessado, mais natural.",
  "Metade do prato em vegetais e fibras.",
  "Hidrate bem — sua água apareceu baixa na balança.",
  "Não treine forte em jejum no começo: combustível primeiro.",
  "Sono e constância pesam mais que dieta perfeita.",
  "Emagrecimento sustentável vem de hábito, não de privação extrema.",
];

const segBtnStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--laranja)" : "var(--panel2)",
  color: active ? "#1a0e06" : "var(--muted)",
  border: `1px solid ${active ? "var(--laranja)" : "var(--line2)"}`,
  borderRadius: 7, fontFamily: "var(--font-oswald)", textTransform: "uppercase",
  letterSpacing: ".07em", fontWeight: 600, fontSize: 12, padding: "8px 14px",
  cursor: "pointer", transition: ".15s",
});

/* ════════════════ JEJUM ════════════════ */
interface JejumRow { id: string; user_id: string; inicio: string; fim: string | null; horas: number | null; alvo_horas: number; alvo_batido: boolean; }

function PaneJejum() {
  const [alvo, setAlvo] = useState(16);
  const [ativo, setAtivo] = useState<JejumRow | null>(null);
  const [historico, setHistorico] = useState<JejumRow[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sb = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from("jejuns").select("*").eq("user_id", user.id).order("inicio", { ascending: false });
    if (!data) return;
    const aberto = data.find((j: JejumRow) => j.fim === null) ?? null;
    setAtivo(aberto);
    setHistorico(data.filter((j: JejumRow) => j.fim !== null));
    if (aberto) setAlvo(aberto.alvo_horas);
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if ("Notification" in window) setNotifPerm(Notification.permission);
  }, []);

  useEffect(() => {
    if (ativo) {
      const tick = () => setElapsed(Date.now() - new Date(ativo.inicio).getTime());
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [ativo]);

  async function pedirNotif() {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotifPerm(p);
  }

  function agendarNotif(inicioISO: string, alvoHoras: number) {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const ms = new Date(inicioISO).getTime() + alvoHoras * 3600000 - Date.now();
    if (ms <= 0) return;
    notifTimerRef.current = setTimeout(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification("Motor Próprio — Jejum completo 🔥", {
            body: `Você completou ${alvoHoras}h de jejum! Hora de comer.`,
            icon: "/icon-192.png",
            tag: "jejum-completo",
          });
        }).catch(() => {
          new Notification("Motor Próprio — Jejum completo 🔥", {
            body: `Você completou ${alvoHoras}h de jejum! Hora de comer.`,
            icon: "/icon-192.png",
          });
        });
      }
    }, ms);
  }

  async function iniciar() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const inicio = new Date().toISOString();
    const { data } = await sb.from("jejuns").insert({ user_id: user.id, inicio, alvo_horas: alvo, alvo_batido: false }).select().single();
    if (data) { setAtivo(data); setElapsed(0); agendarNotif(inicio, alvo); }
  }

  async function encerrar() {
    if (!ativo) return;
    const fim = new Date().toISOString();
    const horas = r1((new Date(fim).getTime() - new Date(ativo.inicio).getTime()) / 3600000);
    const alvo_batido = horas >= ativo.alvo_horas;
    await sb.from("jejuns").update({ fim, horas, alvo_batido }).eq("id", ativo.id);
    setAtivo(null);
    load();
  }

  async function mudarAlvo(h: number) {
    setAlvo(h);
    if (ativo) await sb.from("jejuns").update({ alvo_horas: h }).eq("id", ativo.id);
  }

  const target = alvo * 3600000;
  const pct = ativo ? Math.min(100, elapsed / target * 100) : 0;
  const C = 2 * Math.PI * 54;
  const metaBatida = pct >= 100;
  const endTime = ativo ? new Date(new Date(ativo.inicio).getTime() + target) : null;

  const diasSeguidos = (() => {
    const days = new Set(historico.filter(f => f.alvo_batido).map(f => (f.fim ?? f.inicio).slice(0, 10)));
    let s = 0; const d = new Date(todayISO());
    if (!days.has(todayISO())) d.setDate(d.getDate() - 1);
    while (days.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();

  if (loading) return <div style={{ color: "var(--faint)", padding: 24, textAlign: "center" }}>Carregando…</div>;

  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>Protocolo</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {[16, 18, 20].map(h => (
          <button key={h} style={segBtnStyle(alvo === h)} onClick={() => mudarAlvo(h)}>
            {h}:{24 - h}
          </button>
        ))}
        <button style={segBtnStyle(![16, 18, 20].includes(alvo))} onClick={() => {
          const v = prompt("Horas de jejum como meta?", String(alvo));
          const n = v ? parseInt(v) : NaN;
          if (!isNaN(n) && n > 0 && n < 24) mudarAlvo(n);
        }}>Outro</button>
      </div>

      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", textAlign: "center", padding: "22px 16px", marginBottom: 14 }}>
        {ativo ? (
          <>
            <div style={{ position: "relative", width: 184, height: 184, margin: "0 auto" }}>
              <svg viewBox="0 0 120 120" style={{ width: 184, height: 184, transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="#362E24" strokeWidth="9" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={metaBatida ? "#8FBF8A" : "#FF5A1F"}
                  strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={C.toFixed(1)}
                  strokeDashoffset={(C * (1 - pct / 100)).toFixed(1)}
                  style={{ transition: "stroke-dashoffset 0.5s linear" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 31, color: "var(--txt)" }}>{fmtHMS(elapsed)}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{Math.floor(pct)}%</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "16px 0 4px" }}>
              {metaBatida
                ? `Meta batida 🔥 já pode comer (alvo era ${endTime ? hhmm(endTime) : "—"})`
                : `Faltam ${fmtHMS(target - elapsed)} · meta às ${endTime ? hhmm(endTime) : "—"}`}
            </div>
            <button onClick={encerrar} style={{ background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontSize: 13, marginTop: 8, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Encerrar jejum
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-oswald)", fontSize: 48, fontWeight: 700, color: "var(--couro)" }}>{alvo}h</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "6px 0 18px" }}>meta de jejum · janela de {24 - alvo}h pra comer</div>
            <button onClick={iniciar} style={{ background: "var(--laranja)", color: "#1a0e06", border: "none", borderRadius: 8, padding: "13px 28px", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>
              Iniciar jejum agora
            </button>
          </>
        )}
      </div>

      {notifPerm !== "granted" && notifPerm !== "denied" && (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "11px 13px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Ativar aviso quando o jejum terminar?</div>
          <button onClick={pedirNotif} style={{ background: "var(--laranja)", color: "#1a0e06", border: "none", borderRadius: 8, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700, fontSize: 11, padding: "7px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
            Ativar
          </button>
        </div>
      )}

      <div style={{ fontSize: 11, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>Constância</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        {[
          { v: diasSeguidos, k: "Dias seguidos" },
          { v: historico.length, k: "Jejuns" },
          { v: historico.filter(f => f.alvo_batido).length, k: "Metas batidas" },
        ].map(({ v, k }) => (
          <div key={k} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-oswald)", fontSize: 28, fontWeight: 700, color: "var(--txt)" }}>{v}</div>
            <div style={{ fontSize: 10.5, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.6, margin: "4px 2px" }}>
        O jejum é ferramenta, não obrigação. Não jejue nos treinos fortes — começando do zero, treinar sem combustível derruba desempenho e recuperação. Combine o protocolo e metas de caloria com seu nutricionista.
      </div>
    </div>
  );
}

/* ════════════════ RECEITAS ════════════════ */
function PaneReceitas() {
  const [cat, setCat] = useState("Café da manhã");

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {RECCATS.map(c => (
          <button key={c} style={segBtnStyle(cat === c)} onClick={() => setCat(c)}>
            {c.split("/")[0]}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {RECIPES.filter(r => r.c === cat).map((r, i) => (
          <div key={i} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14 }}>
            <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 16, color: "var(--txt)", letterSpacing: ".02em" }}>{r.n}</div>
            <div style={{ display: "flex", gap: 6, margin: "8px 0" }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", border: "1px solid var(--line)", color: "var(--laranja)", fontWeight: 600 }}>{r.tag}</span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", border: "1px solid var(--line)", color: "var(--couro)", fontWeight: 600 }}>{r.t} min</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--txt)", lineHeight: 1.7, margin: "4px 0 10px" }}>
              {r.ing.map((ing, j) => <div key={j}>• {ing}</div>)}
            </div>
            {r.mod.map((step, j) => (
              <div key={j} style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: "3px 0", paddingLeft: 20, position: "relative" }}>
                <b style={{ position: "absolute", left: 0, color: "var(--couro)" }}>{j + 1}.</b>
                {step}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════ GUIA ════════════════ */
function PaneGuia() {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>
        Princípios pra performance e durar
      </div>
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "4px 16px", marginBottom: 14 }}>
        {GUIA.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 11, padding: "11px 0", borderBottom: i < GUIA.length - 1 ? "1px solid var(--line)" : "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--panel2)", border: "1px solid var(--line2)", color: "var(--laranja)", fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--txt)", lineHeight: 1.5 }}>{g}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--laranja)", marginBottom: 8 }}>Importante</div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          Pra metas de caloria, macros, plano de emagrecimento e qualquer restrição alimentar: procure um nutricionista esportivo. O objetivo aqui é capacidade, saúde e durar — peso é consequência da constância, não a meta.
        </div>
      </div>
    </div>
  );
}

/* ════════════════ PÁGINA ════════════════ */
export default function NutricaoPage() {
  const [sub, setSub] = useState<"jejum" | "receitas" | "guia">("jejum");

  const tabStyle = (k: typeof sub): React.CSSProperties => ({
    flex: 1, background: sub === k ? "var(--laranja)" : "var(--panel)",
    border: `1px solid ${sub === k ? "var(--laranja)" : "var(--line)"}`,
    color: sub === k ? "#1a0e06" : "var(--muted)",
    fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".05em",
    fontSize: 12, fontWeight: 600, padding: "9px 7px", borderRadius: 8,
    cursor: "pointer", transition: ".15s",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button style={tabStyle("jejum")} onClick={() => setSub("jejum")}>Jejum</button>
        <button style={tabStyle("receitas")} onClick={() => setSub("receitas")}>Receitas</button>
        <button style={tabStyle("guia")} onClick={() => setSub("guia")}>Guia</button>
      </div>
      {sub === "jejum" && <PaneJejum />}
      {sub === "receitas" && <PaneReceitas />}
      {sub === "guia" && <PaneGuia />}
    </div>
  );
}
