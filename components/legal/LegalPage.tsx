export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="mb-8 font-display text-3xl font-bold text-ink">{title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-graphite-600 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink">
        {children}
      </div>
    </div>
  );
}
