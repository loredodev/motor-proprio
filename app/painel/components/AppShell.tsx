"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  {
    id: "painel", href: "/painel", label: "Painel",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    id: "registrar", href: "/painel/registrar", label: "Registrar",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    ),
  },
  {
    id: "treinos", href: "/painel/treinos", label: "Treinos",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round">
        <path d="M6.5 6.5l11 11M4 9l-2 2 3 3M9 4l2-2 3 3M15 20l2 2 3-3M20 15l2-2-3-3"/>
      </svg>
    ),
  },
  {
    id: "nutricao", href: "/painel/nutricao", label: "Nutrição",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round">
        <path d="M12 3c-1 3-5 4-5 8a5 5 0 0010 0c0-4-4-5-5-8z"/>
        <path d="M12 8v6"/>
      </svg>
    ),
  },
  {
    id: "mais", href: "/painel/mais", label: "Mais",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width={22} height={22} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.6}>
        {active
          ? <><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></>
          : <><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></>
        }
      </svg>
    ),
  },
];

export default function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSair() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/entrar");
  }

  function isActive(href: string) {
    if (href === "/painel") return pathname === "/painel";
    return pathname.startsWith(href);
  }

  const activeLabel = NAV.find(n => isActive(n.href))?.label ?? "Painel";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", background: "var(--bg)", minHeight: "100vh", display: "flex", position: "relative" }}>

      {/* ── Sidebar desktop ── */}
      <aside className="sidebar-desk" style={{
        display: "none", width: 256, flexShrink: 0, flexDirection: "column",
        background: "linear-gradient(180deg,#141008 0%,#0e0b06 100%)",
        borderRight: "1px solid var(--line)",
        padding: "28px 14px", position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 10px 26px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "linear-gradient(145deg,#FF6830,#C04010)",
            boxShadow: "0 4px 14px rgba(255,90,31,.35)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
          }}>
            <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 22, color: "#0e0b07" }}>M</span>
          </div>
          <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", fontSize: 17, color: "var(--txt)", lineHeight: 1 }}>
            MOTOR <span style={{ color: "var(--laranja)" }}>PRÓPRIO</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--faint)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 5 }}>
            do zero ao campo
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {NAV.map(n => {
            const active = isActive(n.href);
            return (
              <Link key={n.id} href={n.href} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "11px 12px",
                borderRadius: 10, textDecoration: "none", transition: ".18s",
                color: active ? "var(--laranja)" : "var(--muted)",
                background: active ? "rgba(255,90,31,.1)" : "transparent",
                border: `1px solid ${active ? "rgba(255,90,31,.25)" : "transparent"}`,
                boxShadow: active ? "0 0 12px rgba(255,90,31,.08)" : "none",
                fontFamily: "var(--font-oswald)", textTransform: "uppercase",
                letterSpacing: ".07em", fontSize: 13.5, fontWeight: 600,
              }}>
                <span style={{ opacity: active ? 1 : .75 }}>{n.icon(active)}</span>
                {n.label}
                {active && <span style={{
                  marginLeft: "auto", width: 5, height: 5, borderRadius: "50%",
                  background: "var(--laranja)", boxShadow: "0 0 8px var(--laranja)",
                }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <div style={{
            fontSize: 11, color: "var(--faint)", padding: "0 10px 10px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{userEmail}</div>
          <button onClick={handleSair} style={{
            width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid var(--line2)",
            color: "var(--muted)", borderRadius: 9, padding: "10px 12px", cursor: "pointer",
            fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".07em",
            fontSize: 12.5, transition: ".15s", textAlign: "left",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--txt)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >
            ← Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Header mobile */}
        <header className="header-mob" style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(14,11,7,.88)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--line)",
          padding: "12px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 16, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--txt)", lineHeight: 1 }}>
              MOTOR <span style={{ color: "var(--laranja)" }}>PRÓPRIO</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 3 }}>
              {activeLabel}
            </div>
          </div>
          <button onClick={handleSair} style={{
            background: "rgba(255,255,255,.05)", border: "1px solid var(--line2)",
            color: "var(--muted)", borderRadius: 20, padding: "6px 14px",
            cursor: "pointer", fontSize: 11.5, fontFamily: "var(--font-oswald)",
            textTransform: "uppercase", letterSpacing: ".06em",
          }}>Sair</button>
        </header>

        {/* Page content */}
        <main style={{ padding: "22px 18px 110px", flex: 1 }}>
          {children}
        </main>
      </div>

      {/* ── Tabbar mobile ── */}
      <nav className="tabbar-mob" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", maxWidth: 600, margin: "0 auto",
        background: "rgba(10,8,5,.92)", backdropFilter: "blur(24px)",
        borderTop: "1px solid var(--line)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {NAV.map(n => {
          const active = isActive(n.href);
          return (
            <Link key={n.id} href={n.href} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "10px 2px 9px", textDecoration: "none",
              color: active ? "var(--laranja)" : "var(--faint)",
              fontFamily: "var(--font-oswald)", textTransform: "uppercase",
              letterSpacing: ".04em", fontSize: 9, fontWeight: 600,
              transition: "color .15s", position: "relative",
            }}>
              {active && (
                <span style={{
                  position: "absolute", top: 0, left: "20%", right: "20%", height: 2,
                  background: "var(--laranja)",
                  borderRadius: "0 0 3px 3px",
                  boxShadow: "0 0 8px var(--laranja)",
                }} />
              )}
              <span style={{ transform: active ? "scale(1.08)" : "scale(1)", transition: "transform .15s" }}>
                {n.icon(active)}
              </span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 920px) {
          .sidebar-desk { display: flex !important; }
          .tabbar-mob   { display: none !important; }
          .header-mob   { display: none !important; }
          main { max-width: 860px; margin: 0 auto; width: 100%; padding: 28px 36px 60px !important; }
        }
      `}</style>
    </div>
  );
}
