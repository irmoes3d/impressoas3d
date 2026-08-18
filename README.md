# 2 Irmãos Impressões 3D

Site completo (loja, personalização, orçamentos, acompanhamento de pedido e painel
administrativo) para uma marca fictícia de impressão 3D. Next.js 16 (App Router) +
TypeScript + Tailwind CSS v4, com integração real ao Supabase (auth, banco e storage) e
fallback automático para dados fictícios locais enquanto o banco não estiver provisionado.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Conectar o Supabase (dados reais)

O projeto já está preparado para usar um banco Supabase real. Enquanto isso não é feito,
o site funciona normalmente com os dados fictícios de `lib/data/*`.

1. Copie `.env.local.example` para `.env.local` e preencha com as credenciais do seu
   projeto (Project Settings → API): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (esta última é secreta —
   nunca a exponha no navegador nem a versione).
2. Abra o **SQL Editor** do seu projeto Supabase, cole o conteúdo de
   `supabase/schema.sql` e rode. Isso cria todas as tabelas, enums, policies de RLS,
   trigger de criação de perfil e os buckets de storage (`product-images` público e
   `quote-files` privado).
3. Popule com os mesmos dados fictícios da demonstração:
   ```bash
   npm run seed
   ```
   O script cria categorias, produtos, impressoras, materiais, cupons e um usuário
   administrador de demonstração (`admin@2irmaosimpressoes3d.com.br` /
   `Admin@2Irmaos` — troque a senha depois de testar).

A partir daí, catálogo, autenticação de clientes, pedidos, avaliações e orçamentos
personalizados passam a gravar e ler do banco real automaticamente — nenhuma página
precisa ser alterada (veja `lib/repo/products.ts` para o padrão "tenta Supabase, cai para
mock" usado em toda a camada de dados).

## Painel administrativo

Acesse `/admin`. Sem um usuário com `role = admin/funcionario` no Supabase, use o botão
**"Entrar em modo demonstração"** na tela de login do painel para explorar a interface
sem depender do banco.

## Estrutura

```
app/                 rotas (App Router) — loja, checkout, conta, admin
components/          UI reutilizável (loja, produto, admin, marca)
lib/
  data/              dados fictícios (produtos, categorias, pedidos, clientes...)
  repo/              camada de acesso a dados com fallback Supabase → mock
  supabase/          clientes Supabase (browser, server, admin/service-role)
  context/           carrinho, favoritos e autenticação (React Context)
  actions/           Server Actions (orçamento personalizado)
supabase/schema.sql  schema completo do banco (tabelas, enums, RLS, storage)
scripts/seed.ts      popula o Supabase com os dados fictícios
```

## Pontos de integração pendentes

Preparados na interface e na estrutura de dados, mas exigem credenciais reais para
funcionar de ponta a ponta:

- **Pagamentos** — PIX e cartão no checkout (`app/checkout/page.tsx`) geram uma tela
  pronta (inclusive QR/código copia-e-cola de demonstração), mas precisam de um
  provedor real (ex: Mercado Pago) para processar pagamentos de verdade.
- **Frete** — `lib/shipping.ts` simula PAC/SEDEX/transportadora por região; troque pela
  API dos Correios ou do Melhor Envio mantendo a mesma assinatura de retorno.
- **WhatsApp** — os links `wa.me` já funcionam; troque o número em
  `NEXT_PUBLIC_WHATSAPP_NUMBER` (`.env.local`) ou na tela `/admin/configuracoes`.
- **CEP** — já usa a API pública e gratuita do ViaCEP no checkout (integração real, sem
  necessidade de chave).

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` só é usada em `lib/supabase/admin.ts` (marcado
  `server-only`) e em `scripts/seed.ts` — nunca em componentes client.
- RLS habilitado em todas as tabelas (`supabase/schema.sql`), com papéis
  `admin` / `funcionario` / `cliente` controlados pela tabela `profiles`.
- Arquivos enviados em orçamentos personalizados vão para o bucket privado
  `quote-files`, com acesso restrito ao dono do arquivo e à equipe.
