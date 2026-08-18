import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Política de envio" };

export default function Page() {
  return (
    <LegalPage title="Política de envio">
      <p>
        Enviamos para todo o Brasil via Correios (PAC e SEDEX) e transportadoras parceiras via
        Melhor Envio. O frete é calculado automaticamente no checkout a partir do seu CEP.
      </p>
      <h2>Prazos</h2>
      <p>
        O prazo total de entrega soma o tempo de produção do produto (informado na página de cada
        item) mais o prazo de transporte da transportadora escolhida.
      </p>
      <h2>Rastreamento</h2>
      <p>
        Assim que o pedido é postado, o código de rastreamento fica disponível na página de
        acompanhamento do pedido e na área &quot;Minha conta&quot;.
      </p>
    </LegalPage>
  );
}
