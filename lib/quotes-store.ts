"use client";

import type { CustomQuote } from "@/lib/types";

const KEY = "2irmaos:quotes";

export function getStoredQuotes(): CustomQuote[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveStoredQuote(quote: CustomQuote) {
  const quotes = getStoredQuotes();
  localStorage.setItem(KEY, JSON.stringify([quote, ...quotes]));
}
