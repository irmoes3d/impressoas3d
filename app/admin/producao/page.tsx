"use client";

import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { updateStoredOrder, getStoredOrder } from "@/lib/orders-store";
import { KANBAN_STAGE_LABEL, type KanbanStage, type Order } from "@/lib/types";
import { printers } from "@/lib/data/printers";
import { formatDate } from "@/lib/format";

const STAGES: KanbanStage[] = ["aguardando", "arquivo_preparado", "fila_impressao", "imprimindo", "acabamento", "pronto"];

const PRIORITY_TONE: Record<Order["priority"], string> = {
  normal: "bg-graphite-100 text-graphite-500",
  alta: "bg-sun-100 text-sun",
  urgente: "bg-danger/10 text-danger",
};

export default function ProducaoKanbanPage() {
  const seedOrders = useAllOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => setOrders(seedOrders), [seedOrders]);

  function moveTo(id: string, stage: KanbanStage) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, kanbanStage: stage } : o)));
    if (getStoredOrder(id)) updateStoredOrder(id, { kanbanStage: stage });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Fila de produção</h1>
        <p className="text-sm text-graphite-400">Arraste os cards entre as etapas conforme o andamento da impressão.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageOrders = orders.filter((o) => o.kanbanStage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) moveTo(dragId, stage);
              }}
              className="w-72 shrink-0 rounded-2xl bg-graphite-100/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-ink">{KANBAN_STAGE_LABEL[stage]}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-graphite-400">{stageOrders.length}</span>
              </div>

              <div className="space-y-2.5">
                {stageOrders.map((order) => {
                  const printer = printers.find((p) => p.id === order.printerId);
                  return (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={() => setDragId(order.id)}
                      onDragEnd={() => setDragId(null)}
                      className="cursor-grab rounded-xl border border-graphite-100 bg-white p-3.5 shadow-sm active:cursor-grabbing"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-accent">{order.code}</span>
                        <GripVertical size={14} className="text-graphite-300" />
                      </div>
                      <p className="line-clamp-1 text-sm font-medium text-ink">{order.items[0]?.name}{order.items.length > 1 && ` +${order.items.length - 1}`}</p>
                      <p className="text-xs text-graphite-400">{order.customerName}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-graphite-500">
                        {order.items[0]?.customization.colorName && <span className="rounded-full bg-graphite-100 px-2 py-0.5">{order.items[0].customization.colorName}</span>}
                        <span className="rounded-full bg-graphite-100 px-2 py-0.5">Qtd {order.items.reduce((s, i) => s + i.quantity, 0)}</span>
                        {printer && <span className="rounded-full bg-accent-100 px-2 py-0.5 text-accent">{printer.name}</span>}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-graphite-400">{formatDate(order.estimatedDate)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_TONE[order.priority]}`}>{order.priority}</span>
                      </div>
                    </div>
                  );
                })}
                {stageOrders.length === 0 && (
                  <p className="rounded-xl border border-dashed border-graphite-200 px-3 py-6 text-center text-xs text-graphite-300">Vazio</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
