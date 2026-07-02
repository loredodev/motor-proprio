"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ── biblioteca de treinos ── */
const SPORTS = ["Corrida", "Bike", "Natação", "Praia/Força", "Mobilidade"] as const;
type Sport = (typeof SPORTS)[number];

const SPORT_TO_LOG: Record<Sport, string> = {
  Corrida: "Corrida",
  Bike: "Bike",
  Natação: "Natação",
  "Praia/Força": "Força",
  Mobilidade: "Mobilidade",
};

interface Workout {
  s: Sport;
  n: string;
  d: number;
  i: string;
  f: string;
  t: string;
  safe?: string;
}

const WORKOUTS: Workout[] = [
  { s: "Corrida", n: "Caminhada base", d: 30, i: "Z2 leve", f: "Fase 0–1", t: "Caminhada em ritmo de conversa. Constrói base sem impacto. Postura ereta, respiração calma." },
  { s: "Corrida", n: "Caminhada-corrida 1:2", d: 24, i: "Leve", f: "Fase 0–1", t: "8 ciclos de 1 min de trote leve + 2 min de caminhada. Trote devagar. Aqueça 5 min antes." },
  { s: "Corrida", n: "Caminhada-corrida 1:1", d: 24, i: "Leve-mod.", f: "Fase 1", t: "10 ciclos de 1 min trote + 1 min caminhada. Quando o 1:2 ficar confortável." },
  { s: "Corrida", n: "Caminhada-corrida 2:1", d: 27, i: "Moderado", f: "Fase 2", t: "9 ciclos de 2 min trote + 1 min caminhada. Aumenta o volume de corrida." },
  { s: "Corrida", n: "Trote contínuo curto", d: 15, i: "Z2", f: "Fase 2", t: "10–15 min de trote contínuo bem leve. Faltou ar? Volte a caminhar." },
  { s: "Corrida", n: "Longão run/walk", d: 45, i: "Z2", f: "Fase 3", t: "40–50 min alternando trote e caminhada conforme aguentar. Hidrate." },
  { s: "Bike", n: "Pedal Z2 fácil", d: 40, i: "Z2 (conversa)", f: "Fase 0–1", t: "40 min em ritmo que dá pra conversar. Base aeróbica sem impacto — ideal pra começar." },
  { s: "Bike", n: "Pedal Z2 longo", d: 75, i: "Z2", f: "Fase 2–3", t: "60–90 min leve e constante. O treino-chave de resistência. Leve água e comida leve." },
  { s: "Bike", n: "Cadência (giro alto)", d: 40, i: "Leve", f: "Fase 1–2", t: "Marcha leve, pernas girando rápido (90+ rpm). Treina a eficiência da pedalada." },
  { s: "Bike", n: "Subidas suaves", d: 45, i: "Moderado", f: "Fase 2–3", t: "4–6 subidas leves de 2–3 min, recupere descendo. Força nas pernas com cuidado." },
  { s: "Bike", n: "Pedal de recuperação", d: 30, i: "Muito leve", f: "Qualquer", t: "30 min bem tranquilo no dia seguinte a um treino forte." },
  { s: "Bike", n: "Trilha / terreno leve", d: 50, i: "Moderado", f: "Fase 3–4", t: "Pedal em terra/trilha fácil. Atenção ao controle. A aventura começa aqui." },
  { s: "Natação", n: "Técnica: respiração", d: 25, i: "Leve", f: "Fase 0–1", t: "Foco em respirar e flutuar. Muitas pausas. Não é distância, é relaxar na água." },
  { s: "Natação", n: "Pernada com prancha", d: 20, i: "Leve", f: "Fase 0–1", t: "4–6 x 25 m de pernada segurando a prancha. Ensina a posição do corpo." },
  { s: "Natação", n: "Intervalado 25 m", d: 30, i: "Moderado", f: "Fase 1–2", t: "8–10 x 25 m nadando, 30–60 s de pausa. Técnica acima de velocidade." },
  { s: "Natação", n: "Respiração bilateral", d: 25, i: "Leve", f: "Fase 2", t: "Drill respirando dos dois lados (a cada 3 braçadas). Melhora simetria e fôlego." },
  { s: "Natação", n: "Nado contínuo curto", d: 30, i: "Moderado", f: "Fase 2–3", t: "Nade sem parar o máximo que conseguir, crescendo a cada semana." },
  { s: "Natação", n: "Águas abertas", d: 30, i: "Moderado", f: "Fase 3–4", t: "Mar/lago: respeite a corrente, fique perto da margem.", safe: "NUNCA sozinho. Use boia de segurança e fique em área permitida." },
  { s: "Praia/Força", n: "Caminhada na areia", d: 30, i: "Z2", f: "Fase 0–1", t: "Areia firme, ritmo de conversa. Mais desafiador que asfalto e de baixo impacto." },
  { s: "Praia/Força", n: "Circuito funcional", d: 25, i: "Moderado", f: "Fase 1+", t: "3 voltas: 10 agachamentos, 8 flexões (no joelho se precisar), 30 s prancha, 10 afundos." },
  { s: "Praia/Força", n: "Força corpo todo", d: 40, i: "Moderado", f: "Fase 1+", t: "Padrões: agachar, empurrar, puxar, core. 2x/semana. Comece leve. É o que te protege e faz durar." },
  { s: "Praia/Força", n: "Corrida leve na areia", d: 15, i: "Leve", f: "Fase 2+", t: "Curta, na areia firme. A areia exige mais da panturrilha e do tendão.", safe: "Pare se sentir fisgada na panturrilha ou no calcanhar." },
  { s: "Praia/Força", n: "Natação no mar", d: 25, i: "Moderado", f: "Fase 2+", t: "Nadar no mar trabalha o corpo todo e a cabeça.", safe: "Acompanhado, perto da margem, atento à corrente e às bandeiras." },
  { s: "Mobilidade", n: "Mobilidade geral", d: 15, i: "Leve", f: "Qualquer", t: "Quadril, tornozelo, ombro, coluna. 15 min. Faz parte do treino, não é opcional." },
  { s: "Mobilidade", n: "Alongamento pós-treino", d: 12, i: "Leve", f: "Qualquer", t: "Panturrilha, posterior de coxa, quadril, peito. Ajuda a recuperar e evita lesão." },
  { s: "Mobilidade", n: "Recuperação ativa", d: 20, i: "Muito leve", f: "Qualquer", t: "Caminhada leve + mobilidade no dia de descanso. Sangue circulando recupera melhor." },
];

const segBtn = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--laranja)" : "var(--panel2)",
  color: active ? "#1a0e06" : "var(--muted)",
  border: `1px solid ${active ? "var(--laranja)" : "var(--line2)"}`,
  borderRadius: 7,
  fontFamily: "var(--font-oswald)",
  textTransform: "uppercase",
  letterSpacing: ".07em",
  fontWeight: 600,
  fontSize: 12,
  padding: "8px 14px",
  cursor: "pointer",
  transition: ".15s",
  whiteSpace: "nowrap" as const,
});

export default function TreinosPage() {
  const [sport, setSport] = useState<Sport>("Corrida");
  const router = useRouter();

  function registrar(w: Workout) {
    const esporte = SPORT_TO_LOG[w.s];
    const params = new URLSearchParams({ esporte, dur: String(w.d), notas: w.n });
    router.push(`/painel/registrar?${params.toString()}`);
  }

  const filtered = WORKOUTS.filter((w) => w.s === sport);

  return (
    <div>
      <div style={{ fontSize: 13, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 14 }}>
        Biblioteca de treinos
      </div>

      {/* Sport selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {SPORTS.map((sp) => (
          <button key={sp} style={segBtn(sport === sp)} onClick={() => setSport(sp)}>
            {sp}
          </button>
        ))}
      </div>

      {/* Workout cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((w, i) => (
          <div key={i} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 14 }}>
            <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 600, fontSize: 16, color: "var(--txt)", letterSpacing: ".02em" }}>
              {w.n}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", border: "1px solid var(--line)", color: "var(--laranja)", fontWeight: 600 }}>
                {w.i}
              </span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", border: "1px solid var(--line)", color: "var(--couro)", fontWeight: 600 }}>
                {w.d} min
              </span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, background: "var(--panel2)", border: "1px solid var(--line)", color: "var(--couro)", fontWeight: 600 }}>
                {w.f}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "6px 0 10px" }}>
              {w.t}
            </div>
            {w.safe && (
              <div style={{ fontSize: 12, color: "var(--bad)", lineHeight: 1.45, margin: "0 0 10px", display: "flex", gap: 6 }}>
                <span>⚠️</span>
                <span>{w.safe}</span>
              </div>
            )}
            <button
              onClick={() => registrar(w)}
              style={{ background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, transition: ".15s" }}
            >
              Registrar este treino
            </button>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--faint)", margin: "16px 2px 0", lineHeight: 1.6 }}>
        Treinos pra começar com segurança (baixo impacto, caminhada-corrida, descanso). Tenha liberação médica.
      </div>
    </div>
  );
}
