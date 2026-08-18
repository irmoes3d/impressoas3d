import type { Metadata } from "next";
import { GalleryMasonry } from "@/components/gallery/GalleryMasonry";

export const metadata: Metadata = {
  title: "Nossos projetos",
  description: "Galeria de projetos e peças já produzidas pela 2 Irmãos Impressões 3D.",
};

export default function GaleriaPage() {
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold text-ink">Nossos projetos</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-graphite-400">
        Uma vitrine dos projetos que já ganharam forma nas nossas impressoras.
      </p>
      <GalleryMasonry />
    </div>
  );
}
