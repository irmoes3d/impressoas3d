"use client";

import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsappLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";

export function ContactInfoCards() {
  const settings = useStoreSettings();
  const whatsappDisplay = settings.whatsapp.replace(/^55/, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

  return (
    <div className="space-y-4">
      <a
        href={buildWhatsappLink(WHATSAPP_MESSAGES.default, settings.whatsapp)}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5 hover:border-accent"
      >
        <MessageCircle className="text-[#25D366]" size={22} />
        <div>
          <p className="text-sm font-semibold text-ink">WhatsApp</p>
          <p className="text-xs text-graphite-400">{whatsappDisplay}</p>
        </div>
      </a>
      <a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5 hover:border-accent">
        <Mail className="text-accent" size={22} />
        <div>
          <p className="text-sm font-semibold text-ink">E-mail</p>
          <p className="text-xs text-graphite-400">{settings.email}</p>
        </div>
      </a>
      <div className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5">
        <Clock className="text-accent" size={22} />
        <div>
          <p className="text-sm font-semibold text-ink">Atendimento</p>
          <p className="text-xs text-graphite-400">{settings.businessHours}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-graphite-100 p-5">
        <MapPin className="text-accent" size={22} />
        <div>
          <p className="text-sm font-semibold text-ink">{settings.address}</p>
          <p className="text-xs text-graphite-400">Produção própria · envios via Correios e Melhor Envio</p>
        </div>
      </div>
    </div>
  );
}
