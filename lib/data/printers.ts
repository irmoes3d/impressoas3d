import type { Printer } from "@/lib/types";

export const printers: Printer[] = [
  { id: "prt-1", name: "Bambu Lab A1 #1", model: "Bambu Lab A1", status: "imprimindo", currentOrderCode: "2I-4821" },
  { id: "prt-2", name: "Bambu Lab A1 #2", model: "Bambu Lab A1", status: "imprimindo", currentOrderCode: "2I-4830" },
  { id: "prt-3", name: "Ender 3 V3", model: "Creality Ender 3 V3", status: "disponivel" },
  { id: "prt-4", name: "Prusa MK4 #1", model: "Prusa MK4", status: "disponivel" },
  { id: "prt-5", name: "Bambu Lab P1S", model: "Bambu Lab P1S", status: "manutencao" },
  { id: "prt-6", name: "Ender 3 V2", model: "Creality Ender 3 V2", status: "offline" },
];
