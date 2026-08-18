import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { DuckMascot } from "@/components/brand/DuckMascot";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-graphite-900 text-white">
      <div className="layer-lines pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--sun), transparent 70%)" }}
      />

      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:gap-8 lg:py-24">
        <div className="animate-fade-up flex flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
            <Wand2 size={14} /> Impressão 3D sob medida
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.2rem]">
            Transformamos ideias em realidade com impressão 3D
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/70 lg:text-lg">
            De itens personalizados a peças exclusivas, produzimos cada projeto com precisão,
            criatividade e qualidade.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-600"
            >
              Ver produtos <ArrowRight size={16} />
            </Link>
            <Link
              href="/personalizados"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Criar meu projeto
            </Link>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-white/40">
            2 Irmãos Impressões 3D — sua ideia ganha forma
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="relative flex aspect-square w-full max-w-md items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-[1.6rem] border border-white/10"
                style={{
                  inset: `${i * 14}px`,
                  borderColor: i % 2 === 0 ? "rgba(47,91,255,0.35)" : "rgba(255,138,30,0.3)",
                }}
              />
            ))}
            <div className="relative flex gap-2">
              <DuckMascot variant="criativo" className="h-28 w-28 drop-shadow-xl sm:h-36 sm:w-36" />
              <DuckMascot variant="tecnico" facing="left" className="h-28 w-28 drop-shadow-xl sm:h-36 sm:w-36" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
