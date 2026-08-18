import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Entenda o passo a passo de como funciona comprar ou encomendar um produto na 2 Irmãos Impressões 3D.",
};

export default function ComoFuncionaPage() {
  return (
    <div>
      <section className="container-page pt-14 text-center">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Como funciona</h1>
        <p className="mx-auto mt-3 max-w-xl text-graphite-500">
          Do clique à sua porta: veja como cada peça sai da nossa impressora e chega até você.
        </p>
      </section>
      <HowItWorks compact />

      <section className="container-page grid gap-4 pb-16 sm:grid-cols-2">
        <div className="rounded-2xl border border-graphite-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Já sei o que quero</h2>
          <p className="mt-2 text-sm text-graphite-500">Explore o catálogo, escolha cor, tamanho e personalize sua compra.</p>
          <Link href="/produtos" className="mt-4 inline-block text-sm font-semibold text-accent">Ver produtos →</Link>
        </div>
        <div className="rounded-2xl border border-graphite-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Tenho uma ideia própria</h2>
          <p className="mt-2 text-sm text-graphite-500">Envie sua ideia, arquivo 3D ou referência e receba um orçamento sob medida.</p>
          <Link href="/personalizados" className="mt-4 inline-block text-sm font-semibold text-accent">Criar meu projeto →</Link>
        </div>
      </section>
    </div>
  );
}
