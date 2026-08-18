import type { Metadata } from "next";
import Link from "next/link";
import {
  Award, Boxes, Gift, IdCard, LayoutGrid, MessageCircle, Package, Puzzle, Wrench,
} from "lucide-react";
import { buildWhatsappLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Impressão 3D para empresas",
  description: "Brindes personalizados, protótipos, displays e produção em quantidade para empresas com a 2 Irmãos Impressões 3D.",
};

const OFFERS = [
  { icon: Gift, title: "Brindes personalizados" },
  { icon: IdCard, title: "Chaveiros" },
  { icon: Award, title: "Troféus" },
  { icon: LayoutGrid, title: "Displays" },
  { icon: Boxes, title: "Expositores" },
  { icon: Puzzle, title: "Protótipos" },
  { icon: Wrench, title: "Peças técnicas" },
  { icon: IdCard, title: "Identificação" },
  { icon: Package, title: "Organizadores" },
];

export default function EmpresasPage() {
  return (
    <div>
      <section className="bg-graphite-900 text-white">
        <div className="container-page py-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-sun">Para empresas</span>
          <h1 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Impressão 3D para empresas
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Da identidade visual da sua marca a peças técnicas para o seu processo — produzimos em
            quantidade, com prazo e qualidade combinados com o seu negócio.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={buildWhatsappLink(WHATSAPP_MESSAGES.business)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white hover:bg-accent-600"
            >
              <MessageCircle size={16} /> Solicitar orçamento empresarial
            </a>
            <Link href="/personalizados" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
              Enviar projeto pelo formulário
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-ink">O que produzimos para o seu negócio</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {OFFERS.map(({ icon: Icon, title }) => (
            <div key={title} className="flex flex-col items-center gap-3 rounded-2xl border border-graphite-100 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent">
                <Icon size={22} />
              </span>
              <span className="text-sm font-medium text-ink">{title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-graphite-100/50 py-14">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          <Step n="01" title="Conte sobre a demanda" text="Quantidade, prazo, aplicação e referência de marca ou peça técnica." />
          <Step n="02" title="Enviamos uma proposta" text="Orçamento com prazo de produção e opções de material e acabamento." />
          <Step n="03" title="Produzimos em lote" text="Controle de qualidade peça a peça, com entrega para todo o Brasil." />
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <span className="font-display text-3xl font-bold text-graphite-200">{n}</span>
      <h3 className="mt-2 font-display text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-graphite-500">{text}</p>
    </div>
  );
}
