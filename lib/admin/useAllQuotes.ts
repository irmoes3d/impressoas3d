"use client";

import { useEffect, useState } from "react";
import { quotes as seedQuotes } from "@/lib/data/quotes";
import { getStoredQuotes } from "@/lib/quotes-store";
import type { CustomQuote } from "@/lib/types";

export function useAllQuotes(): CustomQuote[] {
  const [quotes, setQuotes] = useState<CustomQuote[]>(seedQuotes);

  useEffect(() => {
    setQuotes([...getStoredQuotes(), ...seedQuotes]);
  }, []);

  return quotes;
}
