import type { Material } from "@/lib/types";

export const materials: Material[] = [
  { id: "mat-1", type: "PLA+", brand: "3DFila", color: "Preto", weightAvailableG: 4200, costPerKg: 89.9, batch: "L2608", lowStockThresholdG: 500 },
  { id: "mat-2", type: "PLA+", brand: "3DFila", color: "Branco", weightAvailableG: 3100, costPerKg: 89.9, batch: "L2601", lowStockThresholdG: 500 },
  { id: "mat-3", type: "PLA+", brand: "Voolt3D", color: "Azul", weightAvailableG: 825, costPerKg: 92.5, batch: "L2599", lowStockThresholdG: 800 },
  { id: "mat-4", type: "PLA+", brand: "Voolt3D", color: "Vermelho", weightAvailableG: 2400, costPerKg: 92.5, batch: "L2590", lowStockThresholdG: 500 },
  { id: "mat-5", type: "PETG", brand: "3DFila", color: "Preto", weightAvailableG: 3600, costPerKg: 109.9, batch: "L2585", lowStockThresholdG: 600 },
  { id: "mat-6", type: "PETG", brand: "3DFila", color: "Branco", weightAvailableG: 410, costPerKg: 109.9, batch: "L2580", lowStockThresholdG: 600 },
  { id: "mat-7", type: "PLA translúcido", brand: "Voolt3D", color: "Natural", weightAvailableG: 1200, costPerKg: 119.9, batch: "L2577", lowStockThresholdG: 400 },
  { id: "mat-8", type: "PLA+", brand: "3DFila", color: "Roxo", weightAvailableG: 260, costPerKg: 92.5, batch: "L2570", lowStockThresholdG: 500 },
];
