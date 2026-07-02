"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWASetup() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("mp-install-dismissed");
      if (!dismissed) setShown(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function instalar() {
    installEvt?.prompt();
    installEvt?.userChoice.then(() => setShown(false));
  }

  function dispensar() {
    setShown(false);
    localStorage.setItem("mp-install-dismissed", "1");
  }

  if (!shown) return null;

  return (
    <div style={{
      position: "fixed", bottom: 72, left: 0, right: 0, zIndex: 999,
      display: "flex", justifyContent: "center", padding: "0 16px",
      pointerEvents: "none",
    }}>
      <div style={{
        background: "var(--panel2)", border: "1px solid var(--line2)",
        borderRadius: 14, padding: "14px 16px", maxWidth: 400, width: "100%",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,.6)", pointerEvents: "all",
      }}>
        <img src="/icon-192.png" alt="ícone" style={{ width: 40, height: 40, borderRadius: 9, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: 14, letterSpacing: ".05em", color: "var(--txt)", textTransform: "uppercase" }}>
            Instalar app
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>
            Adicione Motor Próprio à tela inicial para acesso rápido.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <button onClick={instalar} style={{
            background: "var(--laranja)", color: "#1a0e06", border: "none", borderRadius: 8,
            fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: ".06em",
            fontWeight: 700, fontSize: 11, padding: "7px 12px", cursor: "pointer",
          }}>Instalar</button>
          <button onClick={dispensar} style={{
            background: "none", color: "var(--faint)", border: "none",
            fontSize: 11, cursor: "pointer", textDecoration: "underline",
          }}>Agora não</button>
        </div>
      </div>
    </div>
  );
}
