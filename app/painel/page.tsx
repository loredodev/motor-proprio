import { createClient } from "@/lib/supabase/server";
import { sair } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#14100B] px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1
          className="text-4xl font-bold tracking-widest uppercase text-[#EDE3D2]"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Painel
        </h1>
        <p
          className="text-[#EDE3D2]/50 tracking-widest text-sm uppercase"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          {user.email}
        </p>

        <form action={sair}>
          <button
            type="submit"
            className="mt-4 border border-[#FF5A1F] text-[#FF5A1F] font-bold uppercase tracking-widest px-10 py-3 text-sm hover:bg-[#FF5A1F] hover:text-[#14100B] active:scale-95 transition-all"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
