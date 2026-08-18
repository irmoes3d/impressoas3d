import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { buildWhatsappLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

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

        <div className="space-y-4">
          <a
            href={buildWhatsappLink(WHATSAPP_MESSAGES.default)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5 hover:border-accent"
          >
            <MessageCircle className="text-[#25D366]" size={22} />
            <div>
              <p className="text-sm font-semibold text-ink">WhatsApp</p>
              <p className="text-xs text-graphite-400">(11) 99999-9999</p>
            </div>
          </a>
          <a href="mailto:contato@2irmaosimpressoes3d.com.br" className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5 hover:border-accent">
            <Mail className="text-accent" size={22} />
            <div>
              <p className="text-sm font-semibold text-ink">E-mail</p>
              <p className="text-xs text-graphite-400">contato@2irmaosimpressoes3d.com.br</p>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5">
            <Clock className="text-accent" size={22} />
            <div>
              <p className="text-sm font-semibold text-ink">Atendimento</p>
              <p className="text-xs text-graphite-400">Segunda a sexta, 9h às 18h</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5">
            <MapPin className="text-accent" size={22} />
            <div>
              <p className="text-sm font-semibold text-ink">Atendimento para todo o Brasil</p>
              <p className="text-xs text-graphite-400">Produção própria · envios via Correios e Melhor Envio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
