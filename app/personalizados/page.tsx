import type { Metadata } from "next";
import { Ruler, Sparkles, Upload } from "lucide-react";
import { CustomProjectForm } from "@/components/quotes/CustomProjectForm";

export const metadata: Metadata = {
  title: "Crie seu projeto",
  description: "Tem uma ideia? Nós imprimimos para você. Envie seu projeto ou descreva sua ideia e receba um orçamento personalizado.",
};

export default function PersonalizadosPage() {
  return (
    <div>
      <section className="bg-graphite-900 text-white">
        <div className="container-page grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide">
              <Sparkles size={14} /> Crie seu projeto
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Tem uma ideia? Nós imprimimos para você.
            </h1>
            <p className="mt-4 max-w-lg text-white/70">
              Envie sua ideia, referência ou arquivo 3D e nossa equipe analisa, personaliza e produz
              o seu projeto do zero — do rascunho ao produto pronto na sua casa.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:gap-3">
            {[
              { icon: Sparkles, text: "Descreva sua ideia com o máximo de detalhes" },
              { icon: Upload, text: "Envie arquivos STL, OBJ, 3MF, STEP, fotos ou referências" },
              { icon: Ruler, text: "Receba um orçamento sob medida em até 1 dia útil" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon size={20} className="mb-2 text-sun" />
                <p className="text-sm text-white/80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl rounded-3xl border border-graphite-100 bg-white p-6 shadow-sm sm:p-10">
          <CustomProjectForm />
        </div>
      </section>
    </div>
  );
}
