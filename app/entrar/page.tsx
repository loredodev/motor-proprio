"use client";

import { entrar } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EntrarPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(entrar, undefined);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (state && "ok" in state) {
      setRedirecting(true);
      router.push("/painel");
    }
  }, [state, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#14100B] px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-widest uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <span className="text-[#EDE3D2]">MOTOR </span>
            <span className="text-[#FF5A1F]">PRÓPRIO</span>
          </h1>
          <p
            className="mt-2 text-sm tracking-widest uppercase text-[#EDE3D2]/40"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Entrar na conta
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-widest text-[#EDE3D2]/60"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="bg-[#1e1810] border border-[#EDE3D2]/10 text-[#EDE3D2] placeholder:text-[#EDE3D2]/20 px-4 py-3 outline-none focus:border-[#FF5A1F] transition-colors"
              style={{ fontFamily: "var(--font-oswald)" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-widest text-[#EDE3D2]/60"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-[#1e1810] border border-[#EDE3D2]/10 text-[#EDE3D2] placeholder:text-[#EDE3D2]/20 px-4 py-3 outline-none focus:border-[#FF5A1F] transition-colors"
              style={{ fontFamily: "var(--font-oswald)" }}
            />
          </div>

          {state && "erro" in state && (
            <p
              className="text-sm text-[#FF5A1F] tracking-wide"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {state.erro}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-[#FF5A1F] text-[#14100B] font-bold uppercase tracking-widest py-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {redirecting ? "Redirecionando..." : pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p
          className="text-center text-sm text-[#EDE3D2]/40 tracking-wide"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Ainda não tem conta?{" "}
          <Link
            href="/criar-conta"
            className="text-[#FF5A1F] hover:brightness-110 transition-all"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
