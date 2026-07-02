"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  {
    id: "painel",
    href: "/painel",
    label: "Painel",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={21} height={21}>
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    id: "registrar",
    href: "/painel/registrar",
    label: "Registrar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={21} height={21}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "treinos",
    href: "/painel/treinos",
    label: "Treinos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={21} height={21}>
        <path d="M6.5 6.5l11 11M4 9l-2 2 3 3M9 4l2-2 3 3M15 20l2 2 3-3M20 15l2-2-3-3" />
      </svg>
    ),
  },
  {
    id: "nutricao",
    href: "/painel/nutricao",
    label: "Nutrição",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={21} height={21}>
        <path d="M12 3c-1 3-5 4-5 8a5 5 0 0010 0c0-4-4-5-5-8z" />
        <path d="M12 8v6" />
      </svg>
    ),
  },
  {
    id: "mais",
    href: "/painel/mais",
    label: "Mais",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={21} height={21}>
        <circle cx={5} cy={12} r={1.8} />
        <circle cx={12} cy={12} r={1.8} />
        <circle cx={19} cy={12} r={1.8} />
      </svg>
    ),
  },
];

export default function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  function isActive(href: string) {
    if (href === "/painel") return pathname === "/painel";
    return pathname.startsWith(href);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", background: "var(--bg)", minHeight: "100vh", display: "flex", boxShadow: "0 0 100px rgba(0,0,0,.5)" }}>
      {/* Sidebar — desktop */}
      <aside style={{ display: "none", width: 248, flexShrink: 0, background: "linear-gradient(180deg,#181309,#120F0A)", borderRight: "1px solid var(--line)", padding: "22px 16px", position: "sticky", top: 0, height: "100vh", flexDirection: "column" }} className="sidebar-desk">
        <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", fontSize: 20, color: "var(--txt)", padding: "0 8px", marginBottom: 2 }}>
          MOTOR <span style={{ color: "var(--laranja)" }}>PRÓPRIO</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--faint)", letterSpacing: ".06em", textTransform: "uppercase", padding: "0 8px", marginBottom: 22 }}>
          do zero ao campo
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                borderRadius: 9, color: isActive(n.href) ? "var(--laranja)" : "var(--muted)",
                fontSize: 14.5, fontWeight: 500, textDecoration: "none",
                background: isActive(n.href) ? "var(--panel)" : "transparent",
                border: `1px solid ${isActive(n.href) ? "var(--line2)" : "transparent"}`,
                transition: ".15s",
              }}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: "var(--faint)", padding: "0 8px", marginBottom: 10, lineHeight: 1.5 }}>
            {userEmail}
          </div>
          <button
            onClick={handleSair}
            style={{ width: "100%", background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 13, textAlign: "left", fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em" }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ position: "sticky", top: 0, zIndex: 20, background: "linear-gradient(180deg,#1a150f,#14100B)", borderBottom: "1px solid var(--line)", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, letterSpacing: ".13em", textTransform: "uppercase", fontSize: 18, margin: 0, color: "var(--txt)" }}>
              MOTOR <span style={{ color: "var(--laranja)" }}>PRÓPRIO</span>
            </h1>
            <div style={{ fontSize: 10, color: "var(--faint)", letterSpacing: ".05em", textTransform: "uppercase", marginTop: 2 }}>
              {NAV.find((n) => isActive(n.href))?.label ?? "Painel"}
            </div>
          </div>
          <button
            onClick={handleSair}
            style={{ background: "var(--panel)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em" }}
          >
            Sair
          </button>
        </header>

        <main style={{ padding: "18px 16px 100px", flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Tabbar — mobile */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30, display: "flex", maxWidth: 600, margin: "0 auto", background: "rgba(12,10,7,.95)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)" }} className="tabbar-mob">
        {NAV.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            style={{
              flex: 1, background: "none", color: isActive(n.href) ? "var(--laranja)" : "var(--faint)",
              padding: "9px 2px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".04em",
              fontSize: 9.5, fontWeight: 600, textDecoration: "none", transition: ".15s",
            }}
          >
            {n.icon}
            {n.label}
          </Link>
        ))}
      </nav>

      <style>{`
        @media(min-width:920px){
          .sidebar-desk { display: flex !important; }
          .tabbar-mob { display: none !important; }
          main { max-width: 940px; margin: 0 auto; width: 100%; padding: 24px 32px 60px !important; }
        }
      `}</style>
    </div>
  );
}
