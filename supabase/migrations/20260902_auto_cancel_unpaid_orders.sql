-- Pedidos com pagamento pendente há mais de 24h são cancelados automaticamente
-- pelo cron em /api/cron/cancel-expired-orders (vercel.json).

alter type production_status add value if not exists 'cancelado';

alter table public.orders add column if not exists cancelled_at timestamptz;
