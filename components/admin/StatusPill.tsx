const TONE: Record<string, string> = {
  ok: "bg-ok/10 text-ok",
  warn: "bg-sun/10 text-sun",
  danger: "bg-danger/10 text-danger",
  info: "bg-accent-100 text-accent",
  neutral: "bg-graphite-100 text-graphite-500",
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: keyof typeof TONE }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONE[tone]}`}>{label}</span>;
}

export function paymentTone(status: string): keyof typeof TONE {
  if (status === "aprovado") return "ok";
  if (status === "aguardando") return "warn";
  if (status === "recusado" || status === "estornado") return "danger";
  return "neutral";
}

export function productionTone(status: string): keyof typeof TONE {
  if (status === "entregue") return "ok";
  if (status === "enviado") return "info";
  if (status === "recebido") return "neutral";
  return "warn";
}
