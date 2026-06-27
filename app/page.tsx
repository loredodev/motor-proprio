export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#14100B] px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1
          className="text-6xl font-bold tracking-widest uppercase"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          <span className="text-[#EDE3D2]">MOTOR </span>
          <span className="text-[#FF5A1F]">PRÓPRIO</span>
        </h1>

        <p
          className="text-lg tracking-[0.3em] uppercase text-[#EDE3D2]/60"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          do zero ao campo
        </p>

        <button
          className="mt-4 bg-[#FF5A1F] text-[#14100B] font-bold uppercase tracking-widest px-10 py-3 text-base hover:brightness-110 active:scale-95 transition-all"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Entrar
        </button>
      </div>
    </main>
  );
}
