import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Termos de uso" };

export default function Page() {
  return (
    <LegalPage title="Termos de uso">
      <p>
        Ao utilizar o site da 2 Irmãos Impressões 3D você concorda com os termos descritos abaixo.
        Todos os produtos são fabricados sob demanda ou com estoque limitado, respeitando os prazos
        de produção informados em cada página de produto.
      </p>
      <h2>Pedidos e pagamento</h2>
      <p>
        Os preços exibidos incluem os impostos aplicáveis e podem ser alterados sem aviso prévio
        para novos pedidos. O pagamento é confirmado antes do início da produção.
      </p>
      <h2>Personalização</h2>
      <p>
        Para produtos personalizados (nome, cor, medidas, arquivos enviados), o cliente é
        responsável por conferir as informações antes da confirmação do pedido.
      </p>
      <h2>Propriedade intelectual</h2>
      <p>
        Arquivos e projetos enviados pelo cliente permanecem de propriedade do cliente. A 2 Irmãos
        Impressões 3D não se responsabiliza pelo uso indevido de conteúdo protegido por direitos
        autorais enviado por terceiros.
      </p>
    </LegalPage>
  );
}
