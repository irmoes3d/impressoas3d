import { Check } from "lucide-react";
import { PRODUCTION_STATUS_LABEL, PRODUCTION_STATUS_ORDER, type ProductionStatus } from "@/lib/types";

export function OrderTimeline({ status }: { status: ProductionStatus }) {
  const currentIndex = PRODUCTION_STATUS_ORDER.indexOf(status);

  return (
    <ol className="space-y-0">
      {PRODUCTION_STATUS_ORDER.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
            {i < PRODUCTION_STATUS_ORDER.length - 1 && (
              <span
                className={`absolute left-[13px] top-7 h-full w-0.5 ${done || current ? "bg-accent" : "bg-graphite-200"}`}
              />
            )}
            <span
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                done
                  ? "border-accent bg-accent text-white"
                  : current
                    ? "border-accent bg-white text-accent"
                    : "border-graphite-200 bg-white text-graphite-300"
              }`}
            >
              {done ? <Check size={13} /> : current ? <span className="h-2 w-2 rounded-full bg-accent" /> : ""}
            </span>
            <div className={current ? "font-semibold text-ink" : done ? "text-graphite-600" : "text-graphite-400"}>
              <p className="text-sm">{PRODUCTION_STATUS_LABEL[step]}</p>
              {current && <p className="text-xs text-accent">Etapa atual</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
