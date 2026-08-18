"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-ok/30 bg-ok/5 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-ok" size={36} />
        <p className="font-display text-lg font-semibold text-ink">Mensagem enviada!</p>
        <p className="mt-1 text-sm text-graphite-500">Retornaremos o contato em breve.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder="Seu nome" className="rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
        <input required type="email" placeholder="Seu e-mail" className="rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
      </div>
      <input placeholder="Assunto" className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
      <textarea required rows={5} placeholder="Sua mensagem" className="w-full resize-none rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
      <button type="submit" className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white hover:bg-accent">
        Enviar mensagem
      </button>
    </form>
  );
}
