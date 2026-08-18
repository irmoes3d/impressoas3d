import { Factory, PackageCheck, Sparkle, Truck } from "lucide-react";

const ITEMS = [
  { icon: Factory, title: "Produção própria", text: "Produzido por nós com acompanhamento em todas as etapas." },
  { icon: Sparkle, title: "Personalização", text: "Cores, nomes, tamanhos e detalhes personalizados." },
  { icon: PackageCheck, title: "Qualidade", text: "Impressão de alta definição e excelente acabamento." },
  { icon: Truck, title: "Enviamos para todo o Brasil", text: "Entrega segura diretamente para sua casa." },
];

export function Highlights() {
  return (
    <section className="border-b border-graphite-100 bg-graphite-100/50">
      <div className="container-page grid grid-cols-1 gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-accent shadow-sm">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-0.5 text-sm text-graphite-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
