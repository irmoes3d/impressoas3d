"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";
import { submitCustomQuote, type QuoteFormState } from "@/lib/actions/quotes";
import { saveStoredQuote } from "@/lib/quotes-store";

const ACCEPTED = [".stl", ".obj", ".3mf", ".step", ".stp", ".zip", ".pdf", ".jpg", ".jpeg", ".png"];

const initialState: QuoteFormState = { ok: false };

export function CustomProjectForm() {
  const [state, formAction, pending] = useActionState(async (_prev: QuoteFormState, formData: FormData) => {
    const result = await submitCustomQuote(formData);
    if (result.ok) {
      saveStoredQuote({
        id: crypto.randomUUID(),
        name: String(formData.get("name") ?? ""),
        whatsapp: String(formData.get("whatsapp") ?? ""),
        email: String(formData.get("email") ?? ""),
        description: String(formData.get("description") ?? ""),
        quantity: Number(formData.get("quantity") ?? 1),
        approxSize: String(formData.get("approxSize") ?? ""),
        color: String(formData.get("color") ?? ""),
        material: String(formData.get("material") ?? ""),
        desiredDeadline: String(formData.get("desiredDeadline") ?? ""),
        files: (formData.getAll("files") as File[]).filter((f) => f.size > 0).map((f) => ({ id: crypto.randomUUID(), name: f.name, sizeKb: Math.round(f.size / 1024), type: f.type })),
        status: "novo",
        createdAt: new Date().toISOString(),
      });
    }
    return result;
  }, initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const invalid = incoming.find((f) => !ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext)));
    if (invalid) {
      setFileError(`Formato não aceito: ${invalid.name}. Envie STL, OBJ, 3MF, STEP, ZIP, PDF, JPG ou PNG.`);
      return;
    }
    setFileError(null);
    setFiles((prev) => [...prev, ...incoming]);
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-ok/30 bg-ok/5 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-ok" size={40} />
        <h2 className="font-display text-xl font-bold text-ink">
          Recebemos sua ideia! Vamos analisar seu projeto e entraremos em contato para apresentar o orçamento.
        </h2>
        <p className="mt-2 text-sm text-graphite-500">
          Fique de olho no seu WhatsApp e e-mail — normalmente respondemos em até 1 dia útil.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" required placeholder="Seu nome completo" />
        <Field label="WhatsApp" name="whatsapp" required placeholder="(11) 99999-9999" />
      </div>
      <Field label="E-mail" name="email" type="email" required placeholder="voce@email.com" />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">
          Conte para nós o que você deseja fabricar
        </label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Descreva sua ideia, referências, para que ela vai servir..."
          className="w-full resize-none rounded-xl border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Quantidade" name="quantity" type="number" placeholder="1" defaultValue="1" />
        <Field label="Tamanho aproximado" name="approxSize" placeholder="Ex: 15 x 10 cm" />
        <Field label="Cor desejada" name="color" placeholder="Ex: Azul e branco" />
        <Field label="Material desejado" name="material" placeholder="Ex: PLA, PETG..." />
      </div>
      <Field label="Prazo desejado" name="desiredDeadline" placeholder="Ex: até 20 dias, sem pressa..." />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">
          Arquivos do projeto (STL, OBJ, 3MF, STEP, ZIP, PDF, JPG, PNG)
        </label>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-graphite-300 px-4 py-8 text-center text-sm text-graphite-500 hover:border-accent">
          <Upload size={22} className="text-accent" />
          Clique para selecionar arquivos ou fotos de referência
          <input type="file" name="files" multiple hidden onChange={(e) => handleFiles(e.target.files)} accept={ACCEPTED.join(",")} />
        </label>
        {fileError && <p className="mt-1.5 text-xs text-danger">{fileError}</p>}
        {files.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-graphite-100/70 px-3 py-2 text-xs text-graphite-600">
                <span className="truncate">{f.name} · {Math.round(f.size / 1024)} KB</span>
                <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remover arquivo">
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {pending ? "Enviando..." : "Solicitar orçamento"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
