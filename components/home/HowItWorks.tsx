import { CheckCircle2, Package, Palette, Printer, Truck } from "lucide-react";

const STEPS = [
  { icon: Palette, title: "Você escolhe ou cria", text: "Escolha um produto do catálogo ou envie seu próprio projeto." },
  { icon: CheckCircle2, title: "Personalizamos", text: "Definimos tamanho, cor, material e detalhes." },
  { icon: Printer, title: "Produzimos", text: "A peça é fabricada utilizando impressão 3D." },
  { icon: Package, title: "Finalizamos", text: "Realizamos acabamento e controle de qualidade." },
  { icon: Truck, title: "Enviamos", text: "Seu produto é embalado e enviado para você." },
];

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "bg-graphite-100/50"}>
      <div className="container-page py-14 lg:py-20">
        {!compact && (
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-ink lg:text-3xl">Como funciona</h2>
            <p className="mt-2 text-sm text-graphite-400">Do clique ao produto na sua casa, em 5 passos simples.</p>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-graphite-100 bg-white p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
                <step.icon size={19} strokeWidth={1.8} />
              </span>
              <span className="absolute right-5 top-5 font-display text-2xl font-bold text-graphite-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-graphite-400">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
