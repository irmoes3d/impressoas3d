"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, getStoredSettings, type StoreSettings } from "@/lib/settings-store";

/** Dados de contato/loja editados em /admin/configuracoes, com fallback nos
 * valores padrão até o efeito rodar no cliente (evita mismatch de hidratação). */
export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  return settings;
}
