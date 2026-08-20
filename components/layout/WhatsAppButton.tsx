"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsappLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";

export function WhatsAppButton() {
  const settings = useStoreSettings();

  return (
    <a
      href={buildWhatsappLink(WHATSAPP_MESSAGES.default, settings.whatsapp)}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 active:scale-95"
    >
      <MessageCircle size={26} fill="white" className="text-[#25D366]" />
    </a>
  );
}
