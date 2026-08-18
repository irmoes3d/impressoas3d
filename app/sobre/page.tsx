import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import { Camera, Printer, Ruler, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a história da 2 Irmãos Impressões 3D: dois irmãos, uma paixão por criar e transformar ideias em produtos reais.",
};

export default function SobrePage() {
  return (
    <div>
      <section className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">Sobre nós</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Dois irmãos. Uma paixão por criar.
          </h1>
          <p className="mt-5 text-graphite-600">
            A 2 Irmãos Impressões 3D nasceu da união entre criatividade, tecnologia e vontade de
            transformar ideias em objetos reais.
          </p>
          <p className="mt-4 text-graphite-600">
            Cada peça passa por nossas mãos, desde a preparação do projeto até a impressão e o
            acabamento.
          </p>
          <p className="mt-4 text-graphite-600">
            Nosso objetivo é criar produtos únicos e fazer com que aquilo que antes existia apenas
            como ideia possa ganhar forma.
          </p>
        </div>
        <div className="flex items-center justify-center rounded-[2rem] bg-graphite-900 p-10">
          <Logo href={null} size={240} />
        </div>
      </section>

      <section className="bg-graphite-100/50 py-14">
        <div className="container-page grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "O lado criativo", text: "Modelagem, personalização e design de cada peça — pensando em como fazer sua ideia ganhar forma." },
            { icon: Printer, title: "O lado técnico", text: "Calibração, materiais e controle de qualidade em cada impressora, camada por camada." },
            { icon: Ruler, title: "Sob medida", text: "Nenhum projeto é grande ou pequeno demais — trabalhamos peça a peça, com atenção aos detalhes." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-6">
              <Icon size={22} className="mb-3 text-accent" />
              <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-graphite-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-center gap-2">
          <Camera size={18} className="text-accent" />
          <h2 className="font-display text-xl font-bold text-ink">Bastidores e equipamentos</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["oficina-1", "oficina-2", "impressoras-fila", "acabamento-peca"].map((seed) => (
            <div key={seed} className="aspect-square overflow-hidden rounded-2xl bg-graphite-100">
              <ProductPlaceholder seed={seed} alt="Bastidores da produção" className="h-full w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
