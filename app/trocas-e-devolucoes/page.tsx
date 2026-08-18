import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Trocas e devoluções" };

export default function Page() {
  return (
    <LegalPage title="Trocas e devoluções">
      <p>
        Você pode solicitar a troca ou devolução de produtos com defeito de fabricação em até 7 dias
        corridos após o recebimento, conforme o Código de Defesa do Consumidor.
      </p>
      <h2>Produtos personalizados</h2>
      <p>
        Produtos fabricados sob medida (com nome, cor ou dimensões personalizadas) não são
        elegíveis para devolução por arrependimento, exceto em caso de defeito de fabricação ou
        divergência do que foi combinado no orçamento.
      </p>
      <h2>Como solicitar</h2>
      <p>
        Entre em contato pelo WhatsApp ou e-mail informando o número do pedido e fotos do produto.
        Nossa equipe avalia o caso em até 2 dias úteis.
      </p>
    </LegalPage>
  );
}
