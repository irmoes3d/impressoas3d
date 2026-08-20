"use client";

// Fallback local: garante que os dados de contato da loja editados no painel
// reflitam no site (Header/Footer/Contato) mesmo antes de existir uma tabela
// de configurações no Supabase. Lido por lib/hooks/useStoreSettings.ts.
const KEY = "2irmaos:store-settings";

export interface StoreSettings {
  storeName: string;
  email: string;
  whatsapp: string;
  instagram: string;
  address: string;
  businessHours: string;
  cnpj: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "2 Irmãos Impressões 3D",
  email: "contato@2irmaosimpressoes3d.com.br",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999",
  instagram: "@2irmaosimpressoes3d",
  address: "Atendimento para todo o Brasil",
  businessHours: "Segunda a sexta, 9h às 18h",
  cnpj: "",
};

export function getStoredSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
