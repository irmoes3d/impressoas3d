import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfoCards } from "@/components/contact/ContactInfoCards";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a 2 Irmãos Impressões 3D pelo WhatsApp, e-mail ou formulário de contato.",
};

export default function ContatoPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-bold text-ink">Contato</h1>
      <p className="mt-1 mb-10 max-w-xl text-sm text-graphite-400">
        Dúvidas, sugestões ou uma ideia para conversar? Fale com a gente.
      </p>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-graphite-100 bg-white p-6 sm:p-8">
          <ContactForm />
        </div>

        <ContactInfoCards />
      </div>
    </div>
  );
}
