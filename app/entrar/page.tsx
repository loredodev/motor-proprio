"use client";

import { entrar } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EntrarPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(entrar, undefined);
  const [redirecting, setRedirecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (state && "ok" in state) {
      setRedirecting(true);
      router.push("/painel");
    }
  }, [state, router]);

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,90,31,.12), transparent), var(--bg2)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
    }}>
      {/* Logo */}
      <div
        style={{
          marginBottom: 44,
          textAlign: "center",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity .5s ease, transform .5s ease",
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
          background: "linear-gradient(145deg,#FF6830,#C04010)",
          boxShadow: "0 8px 32px rgba(255,90,31,.4), 0 2px 8px rgba(0,0,0,.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 36, color: "#0e0b07", lineHeight: 1 }}>M</span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-oswald)", fontWeight: 700, letterSpacing: ".16em",
          textTransform: "uppercase", fontSize: 26, margin: 0, lineHeight: 1,
        }}>
          <span style={{ color: "var(--txt)" }}>MOTOR </span>
          <span style={{ color: "var(--laranja)" }}>PRÓPRIO</span>
        </h1>
        <p style={{
          marginTop: 8, fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase",
          color: "var(--faint)", fontFamily: "var(--font-oswald)",
        }}>
          do zero ao campo
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 380,
        background: "linear-gradient(160deg, rgba(28,22,14,.9), rgba(16,13,9,.95))",
        border: "1px solid var(--line2)",
        borderRadius: 18,
        padding: "32px 28px",
        boxShadow: "0 24px 64px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.04) inset",
        backdropFilter: "blur(20px)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity .5s .1s ease, transform .5s .1s ease",
      }}>
        <p style={{
          fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".08em",
          fontSize: 13, color: "var(--muted)", marginBottom: 24, marginTop: 0,
        }}>
          Entrar na conta
        </p>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{
              display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".07em",
              color: "var(--faint)", marginBottom: 8, fontFamily: "var(--font-oswald)",
            }}>E-mail</label>
            <input
              name="email" type="email" required placeholder="seu@email.com"
              style={{
                width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid var(--line2)",
                borderRadius: 10, color: "var(--txt)", fontSize: 15, padding: "13px 14px",
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color .2s, box-shadow .2s",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--laranja)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,90,31,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--line2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{
              display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".07em",
              color: "var(--faint)", marginBottom: 8, fontFamily: "var(--font-oswald)",
            }}>Senha</label>
            <input
              name="password" type="password" required placeholder="••••••••"
              style={{
                width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid var(--line2)",
                borderRadius: 10, color: "var(--txt)", fontSize: 15, padding: "13px 14px",
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color .2s, box-shadow .2s",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--laranja)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,90,31,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--line2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {state && "erro" in state && (
            <div style={{
              fontSize: 13, color: "var(--bad)", background: "rgba(224,121,90,.1)",
              border: "1px solid rgba(224,121,90,.25)", borderRadius: 8, padding: "10px 12px",
            }}>
              {state.erro}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || redirecting}
            className="btn-primary"
            style={{ marginTop: 6 }}
          >
            {redirecting ? "Redirecionando…" : pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p style={{
          textAlign: "center", fontSize: 13, color: "var(--faint)", marginTop: 22, marginBottom: 0,
          fontFamily: "var(--font-oswald)", letterSpacing: ".04em",
        }}>
          Ainda não tem conta?{" "}
          <Link href="/criar-conta" style={{ color: "var(--laranja)", textDecoration: "none", fontWeight: 600 }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
