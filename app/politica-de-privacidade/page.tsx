import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function Page() {
  return (
    <LegalPage title="Política de privacidade">
      <p>
        A 2 Irmãos Impressões 3D coleta apenas os dados necessários para processar pedidos e
        orçamentos: nome, e-mail, telefone, endereço de entrega e, quando aplicável, arquivos
        enviados para produção sob medida.
      </p>
      <h2>Como usamos seus dados</h2>
      <p>
        Utilizamos suas informações para produzir e enviar pedidos, calcular frete, emitir cobranças
        e entrar em contato sobre o andamento da produção. Não vendemos seus dados a terceiros.
      </p>
      <h2>Armazenamento</h2>
      <p>
        Os dados são armazenados em infraestrutura Supabase com controle de acesso por perfil
        (cliente, funcionário, administrador) e políticas de segurança em nível de linha (RLS).
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar a atualização ou exclusão dos seus dados a qualquer momento pela área
        &quot;Minha conta&quot; ou entrando em contato pelo e-mail contato@2irmaosimpressoes3d.com.br.
      </p>
    </LegalPage>
  );
}
